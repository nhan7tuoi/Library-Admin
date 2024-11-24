import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Input, Button, List, Typography, message, Spin, notification, Popconfirm } from "antd";
import "@react-pdf-viewer/core/lib/styles/index.css"; 
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { _createChapter, _createSummary, _deleteChapter, _getChapters } from "./apis";
import { CAlert, CCol, CRow } from "@coreui/react";

const { Title, Text } = Typography;

export default function AddChapterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location || {};
  const { data } = state || {};
  console.log("a",data);
  const bookId = useRef(data.bookId);
  const [chapters, setChapters] = useState([]);
  const [pdfFile, setPdfFile] = useState(data.pdfLink); 
  const [numPages, setNumPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await _getChapters(bookId.current);
      console.log(response);
      setChapters(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const [formData, setFormData] = useState({
    book: bookId.current,
    title: "",
    startPage: 0,
    endPage: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const data = new FormData();
    data.append("book", formData.book);
    data.append("title", formData.title);
    data.append("startPage", formData.startPage);
    data.append("endPage", formData.endPage);

    try {
     const response = await _createChapter(data);
      if (response.data) {
        fetchData();
        openNotification(true,"Chương đã được thêm thành công!","Thành công")();
        setFormData({ ...formData, title: "", startPage: 0, endPage: 0 });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      openNotification(true,"Đã xảy ra lỗi khi thêm chương!","Lỗi")();
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const response = await _deleteChapter(id);
      if (response.data) {
        setChapters(chapters.filter((chapter) => chapter._id !== id));
        openNotification(true,"Chương đã được xóa thành công!","Thành công")();
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      openNotification(true,"Đã xảy ra lỗi khi xóa chương!","Lỗi")();
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  const renderToolbar = (Toolbar) => ( 
    <Toolbar> 
      {(slots) => { 
        const { 
          CurrentPageInput, 
          EnterFullScreen, 
          GoToNextPage, 
          GoToPreviousPage, 
          NumberOfPages, 
          ShowSearchPopover, 
          Zoom, 
          ZoomIn, 
          ZoomOut, 
        } = slots; 
        return ( 
          <div 
            style={{ 
              alignItems: "center", 
              display: "flex", 
              width: "100%", 
            }} 
          > 
            <div style={{ padding: "0px 2px" }}> 
              <ShowSearchPopover /> 
            </div> 
            <div style={{ padding: "0px 2px" }}> 
              <ZoomOut /> 
            </div> 
            <div style={{ padding: "0px 2px" }}> 
              <Zoom /> 
            </div> 
            <div style={{ padding: "0px 2px" }}> 
              <ZoomIn /> 
            </div> 
            <div style={{ padding: "0px 2px", marginLeft: "auto" }}> 
              <GoToPreviousPage /> 
            </div> 
            <div style={{ padding: "0px 2px", display:'flex',flexDirection:'row' }}> 
              <CurrentPageInput />/ <NumberOfPages /> 
            </div> 
            <div style={{ padding: "0px 2px" }}> 
              <GoToNextPage /> 
            </div> 
            <div style={{ padding: "0px 2px", marginLeft: "auto" }}> 
              <EnterFullScreen /> 
            </div> 
          </div> 
        ); 
      }} 
    </Toolbar> 
  ); 
  const defaultLayoutPluginInstance = defaultLayoutPlugin({ 
    renderToolbar, 
    sidebarTabs: (defaultTabs) => [defaultTabs[0], defaultTabs[1]], 
  }); 
 
  const characterMap = { 
    isCompressed: true, 
    url: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/", 
  };

  const handleFinish = async () => {
    const userConfirmed = window.confirm("Bạn đã chắc chắn nhập xong chương chưa?");
  
    if (userConfirmed) {
      try {
        setIsLoading(true);
        await _createSummary({ bookId: data.bookId, title: data.title });
        setIsLoading(false);
        navigate("/books/list");
       message.success("Bạn đã tạo sách thành công!");
      } catch (error) {
        console.error("Error submitting form:", error);
        message.error("Đã xảy ra lỗi khi gửi yêu cầu.");
      }
    } else {
      message.info("Vui lòng nhập xong chương trước khi hoàn thành.");
    }
  };

  const openNotification = (pauseOnHover,description,title) => () => {
    api.open({
      message: title,
      description:description,
      showProgress: true,
      pauseOnHover,
    });
  };

  return (
    <>
    {contextHolder}
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
    <div style={{ display: 'flex', padding: '20px' }}>
    {isLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}>
            <Spin size="large" tip="Đang tải..." />
          </div>
        )}
      <div style={{ flex: 1 }}>
        {/* <Title level={3}>Xem PDF</Title> */}
        <div style={{ border: '1px solid #ddd', padding: '10px', height: '600px', overflowY: 'auto' }}>
        <Viewer
        fileUrl={pdfFile}
        plugins={[defaultLayoutPluginInstance]}
        onDocumentLoadSuccess={onDocumentLoadSuccess}
        characterMap={characterMap}
         />
        </div>
      </div>

      <div style={{ flex: 1, paddingLeft: '20px' }}>
        <Title level={2}>Thêm Chương Mới</Title>
        <Form onSubmit={handleSubmit} layout="vertical">
          <Form.Item label="Tiêu đề chương" required>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề chương"
              required
            />
          </Form.Item>
          <Form.Item label="Trang bắt đầu" required>
            <Input
              type="number"
              name="startPage"
              value={formData.startPage}
              onChange={handleInputChange}
              required
            />
          </Form.Item>
          <Form.Item label="Trang kết thúc" required>
            <Input
              type="number"
              name="endPage"
              value={formData.endPage}
              onChange={handleInputChange}
              required
            />
          </Form.Item>
          <Form.Item>
            <CRow xs={12}>
            <CCol  md={9}>
            <Button onClick={()=>{
              handleSubmit();
            }} type="primary" htmlType="submit">
              Thêm Chương
            </Button>
            </CCol>
            <CCol md={3}>
            <Button onClick={()=>{
              handleFinish();
            }}
            type="primary"
            style={{backgroundColor: '#52c41a', color: 'white'}} 
            >
              Hoàn thành
            </Button>
            </CCol>
            </CRow>
          </Form.Item>
        </Form>
        <Title level={3}>Danh Sách Chương</Title>
        <List
          bordered
          dataSource={chapters}
          renderItem={(chapter) => (
            <List.Item
              actions={[
                <Popconfirm
    title="Xoá sách"
    description="Bạn có chắc chắn muốn xóa sách này không?"
    onConfirm={()=>{
      handleDelete(chapter._id);
    }}
    onCancel={()=>{}}
    okText="Có"
    cancelText="Không"
  >
    <Button danger>Xoá</Button>
  </Popconfirm>
              ]}
            >
              <Text strong>{chapter.title}</Text> - Trang {chapter.startPage} đến {chapter.endPage}
            </List.Item>
          )}
        />
      </div>
    </div>
    </Worker>
    </>
  );
}
