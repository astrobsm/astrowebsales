import React, { useState, useEffect } from 'react';
import { 
  FileText, Video, GraduationCap, Download, Plus, Edit, Trash2, 
  X, Save, Upload, Eye, Lock, Unlock, RefreshCw, Cloud, CloudOff, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { useContentStore } from '../../store/contentStore';

const AdminContentManagement = () => {
  const { 
    isAdminAuthenticated, authenticateAdmin, logoutAdmin,
    articles, videos, training, downloads,
    addArticle, updateArticle, deleteArticle,
    addVideo, updateVideo, deleteVideo,
    addTraining, updateTraining, deleteTraining,
    addDownload, updateDownload, deleteDownload,
    // Sync functions
    fetchContentFromServer, uploadContentToServer,
    isSyncing, lastSyncTime, syncError, isServerSynced
  } = useContentStore();

  const [activeTab, setActiveTab] = useState('articles');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [password, setPassword] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(!isAdminAuthenticated);

  // Form states
  const [articleForm, setArticleForm] = useState({
    title: '', content: '', excerpt: '', author: '', category: '', featured: false
  });
  const [videoForm, setVideoForm] = useState({
    title: '', url: '', duration: '', category: '', description: ''
  });
  const [trainingForm, setTrainingForm] = useState({
    title: '', description: '', duration: '', level: '', price: '', modules: '', featured: false
  });
  const [downloadForm, setDownloadForm] = useState({
    title: '', description: '', fileType: 'PDF', fileSize: '', category: ''
  });

  const handleAuthenticate = () => {
    if (authenticateAdmin(password)) {
      setShowAuthModal(false);
      toast.success('Admin authenticated successfully!');
    } else {
      toast.error('Invalid password');
    }
    setPassword('');
  };

  const handleLogout = () => {
    logoutAdmin();
    setShowAuthModal(true);
    toast.success('Logged out of admin mode');
  };

  const generatePDF = (item, type) => {
    const doc = new jsPDF();
    
    // Add company logo
    const logoWidth = 40;
    const logoHeight = 40;
    doc.addImage('/logo.png', 'PNG', 15, 10, logoWidth, logoHeight);
    
    // Header
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('BONNESANTE MEDICALS', 60, 25);
    doc.text('17A Isuofia Street Federal Housing Estate', 60, 32);
    doc.text('Trans Ekulu, Enugu, Nigeria', 60, 39);
    doc.text('+234 902 872 4839, +234 702 575 5406 | astrobsm@gmail.com', 60, 46);
    
    // Line separator
    doc.setDrawColor(40, 125, 77);
    doc.setLineWidth(1);
    doc.line(15, 55, 195, 55);
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 125, 77);
    doc.text(item.title, 15, 70);
    
    // Content based on type
    doc.setFontSize(12);
    doc.setTextColor(0);
    
    let yPos = 85;
    
    if (type === 'article') {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Author: ${item.author} | Category: ${item.category}`, 15, yPos);
      doc.text(`Date: ${item.date}`, 15, yPos + 7);
      yPos += 20;
      
      doc.setFontSize(12);
      doc.setTextColor(0);
      const splitContent = doc.splitTextToSize(item.content, 180);
      doc.text(splitContent, 15, yPos);
    } else if (type === 'training') {
      doc.text(`Duration: ${item.duration}`, 15, yPos);
      doc.text(`Level: ${item.level}`, 15, yPos + 10);
      doc.text(`Price: ${item.price}`, 15, yPos + 20);
      doc.text(`Modules: ${item.modules}`, 15, yPos + 30);
      yPos += 45;
      
      const splitDesc = doc.splitTextToSize(item.description, 180);
      doc.text(splitDesc, 15, yPos);
    } else if (type === 'download') {
      doc.text(`Category: ${item.category}`, 15, yPos);
      doc.text(`File Type: ${item.fileType} | Size: ${item.fileSize}`, 15, yPos + 10);
      yPos += 25;
      
      const splitDesc = doc.splitTextToSize(item.description, 180);
      doc.text(splitDesc, 15, yPos);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('© 2026 Bonnesante Medicals. All rights reserved.', 105, 285, { align: 'center' });
    doc.text('www.bonnesante.com', 105, 290, { align: 'center' });
    
    doc.save(`${item.title.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (item) {
      switch(type) {
        case 'article':
          setArticleForm({ ...item });
          break;
        case 'video':
          setVideoForm({ ...item });
          break;
        case 'training':
          setTrainingForm({ ...item });
          break;
        case 'download':
          setDownloadForm({ ...item });
          break;
      }
    } else {
      setArticleForm({ title: '', content: '', excerpt: '', author: '', category: '', featured: false });
      setVideoForm({ title: '', url: '', duration: '', category: '', description: '' });
      setTrainingForm({ title: '', description: '', duration: '', level: '', price: '', modules: '', featured: false });
      setDownloadForm({ title: '', description: '', fileType: 'PDF', fileSize: '', category: '' });
    }
    
    setShowModal(true);
  };

  const handleSave = () => {
    try {
      switch(modalType) {
        case 'article':
          if (editingItem) {
            updateArticle(editingItem.id, articleForm);
          } else {
            addArticle(articleForm);
          }
          break;
        case 'video':
          if (editingItem) {
            updateVideo(editingItem.id, videoForm);
          } else {
            addVideo(videoForm);
          }
          break;
        case 'training':
          if (editingItem) {
            updateTraining(editingItem.id, trainingForm);
          } else {
            addTraining(trainingForm);
          }
          break;
        case 'download':
          if (editingItem) {
            updateDownload(editingItem.id, downloadForm);
          } else {
            addDownload(downloadForm);
          }
          break;
      }
      toast.success(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} saved successfully!`);
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleDelete = (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    switch(type) {
      case 'article': deleteArticle(id); break;
      case 'video': deleteVideo(id); break;
      case 'training': deleteTraining(id); break;
      case 'download': deleteDownload(id); break;
    }
    toast.success('Deleted successfully!');
  };

  // Sync handlers
  const handleSyncFromServer = async () => {
    toast.loading('Syncing from server...', { id: 'sync' });
    const success = await fetchContentFromServer();
    if (success) {
      toast.success('Content synced from server!', { id: 'sync' });
    } else {
      toast.error('Failed to sync from server', { id: 'sync' });
    }
  };

  const handleUploadToServer = async () => {
    toast.loading('Uploading to server...', { id: 'upload' });
    const success = await uploadContentToServer();
    if (success) {
      toast.success('Content uploaded to server!', { id: 'upload' });
    } else {
      toast.error('Failed to upload to server', { id: 'upload' });
    }
  };

  const tabs = [
    { id: 'articles', label: 'Articles', icon: FileText, count: articles.length },
    { id: 'videos', label: 'Videos', icon: Video, count: videos.length },
    { id: 'training', label: 'Training', icon: GraduationCap, count: training.length },
    { id: 'downloads', label: 'Downloads', icon: Download, count: downloads.length }
  ];

  // Auth Modal
  if (showAuthModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Lock size={48} className="mx-auto text-primary-600 mb-4" />
            <h2 className="text-2xl font-display font-bold text-gray-900">Admin Authentication</h2>
            <p className="text-gray-600 mt-2">Enter admin password to manage content</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
            placeholder="Enter password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
          />
          <button onClick={handleAuthenticate} className="w-full btn-primary">
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900">Content Management</h1>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="btn-secondary flex items-center text-sm">
            <Unlock size={16} className="mr-2" />
            Logout Admin
          </button>
          <button onClick={() => openModal(activeTab.slice(0, -1))} className="btn-primary flex items-center">
            <Plus size={20} className="mr-2" />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>
      </div>

      {/* Sync Status Bar */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isServerSynced ? (
                <Cloud className="text-green-600" size={20} />
              ) : (
                <CloudOff className="text-orange-500" size={20} />
              )}
              <span className="text-sm font-medium">
                {isServerSynced ? 'Synced with Server' : 'Local Only'}
              </span>
            </div>
            {lastSyncTime && (
              <span className="text-sm text-gray-500">
                Last sync: {new Date(lastSyncTime).toLocaleString()}
              </span>
            )}
            {syncError && (
              <span className="text-sm text-red-500">
                Error: {syncError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncFromServer}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              Pull from Server
            </button>
            <button
              onClick={handleUploadToServer}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
            >
              <Upload size={16} />
              Push to Server
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Changes are automatically synced to all devices. Use "Pull from Server" to get latest changes or "Push to Server" to upload your local content.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={18} className="mr-2" />
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-gray-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'articles' && articles.map(article => (
          <div key={article.id} className="card p-6">
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded text-xs ${article.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                {article.featured ? 'Featured' : article.category}
              </span>
              <div className="flex gap-1">
                <button onClick={() => generatePDF(article, 'article')} className="p-1 hover:bg-gray-100 rounded">
                  <Download size={16} className="text-gray-500" />
                </button>
                <button onClick={() => openModal('article', article)} className="p-1 hover:bg-gray-100 rounded">
                  <Edit size={16} className="text-gray-500" />
                </button>
                <button onClick={() => handleDelete('article', article.id)} className="p-1 hover:bg-red-100 rounded">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
            <p className="text-xs text-gray-400">By {article.author} • {article.date}</p>
          </div>
        ))}

        {activeTab === 'videos' && videos.map(video => (
          <div key={video.id} className="card p-6">
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <Video size={32} className="text-gray-400" />
            </div>
            <div className="flex items-start justify-between mb-2">
              <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{video.category}</span>
              <span className="text-xs text-gray-500">{video.duration}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
            <div className="flex gap-2">
              <button onClick={() => openModal('video', video)} className="flex-1 btn-secondary text-sm">
                <Edit size={14} className="mr-1 inline" /> Edit
              </button>
              <button onClick={() => handleDelete('video', video.id)} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'training' && training.map(course => (
          <div key={course.id} className="card p-6">
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded text-xs ${course.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                {course.level}
              </span>
              <div className="flex gap-1">
                <button onClick={() => generatePDF(course, 'training')} className="p-1 hover:bg-gray-100 rounded">
                  <Download size={16} className="text-gray-500" />
                </button>
                <button onClick={() => openModal('training', course)} className="p-1 hover:bg-gray-100 rounded">
                  <Edit size={16} className="text-gray-500" />
                </button>
                <button onClick={() => handleDelete('training', course.id)} className="p-1 hover:bg-red-100 rounded">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{course.duration}</span>
              <span className="font-semibold text-primary-600">{course.price}</span>
            </div>
          </div>
        ))}

        {activeTab === 'downloads' && downloads.map(download => (
          <div key={download.id} className="card p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText size={20} className="text-red-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">{download.fileType} • {download.fileSize}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => generatePDF(download, 'download')} className="p-1 hover:bg-gray-100 rounded">
                  <Download size={16} className="text-gray-500" />
                </button>
                <button onClick={() => openModal('download', download)} className="p-1 hover:bg-gray-100 rounded">
                  <Edit size={16} className="text-gray-500" />
                </button>
                <button onClick={() => handleDelete('download', download.id)} className="p-1 hover:bg-red-100 rounded">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{download.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{download.description}</p>
            <p className="text-xs text-gray-400">{download.downloads} downloads</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-display font-semibold">
                {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalType === 'article' && (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Author"
                    value={articleForm.author}
                    onChange={(e) => setArticleForm({...articleForm, author: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({...articleForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Excerpt (short summary)"
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm({...articleForm, excerpt: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    placeholder="Full content..."
                    value={articleForm.content}
                    onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={articleForm.featured}
                      onChange={(e) => setArticleForm({...articleForm, featured: e.target.checked})}
                      className="mr-2"
                    />
                    Featured article
                  </label>
                </>
              )}

              {modalType === 'video' && (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="YouTube/Video URL"
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({...videoForm, url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Duration (e.g., 10:30)"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({...videoForm, duration: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={videoForm.category}
                      onChange={(e) => setVideoForm({...videoForm, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <textarea
                    placeholder="Description..."
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                </>
              )}

              {modalType === 'training' && (
                <>
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={trainingForm.title}
                    onChange={(e) => setTrainingForm({...trainingForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Duration (e.g., 6 weeks)"
                      value={trainingForm.duration}
                      onChange={(e) => setTrainingForm({...trainingForm, duration: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={trainingForm.level}
                      onChange={(e) => setTrainingForm({...trainingForm, level: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Price (e.g., ₦50,000)"
                      value={trainingForm.price}
                      onChange={(e) => setTrainingForm({...trainingForm, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Number of Modules"
                      value={trainingForm.modules}
                      onChange={(e) => setTrainingForm({...trainingForm, modules: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <textarea
                    placeholder="Course description..."
                    value={trainingForm.description}
                    onChange={(e) => setTrainingForm({...trainingForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={trainingForm.featured}
                      onChange={(e) => setTrainingForm({...trainingForm, featured: e.target.checked})}
                      className="mr-2"
                    />
                    Featured course
                  </label>
                </>
              )}

              {modalType === 'download' && (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={downloadForm.title}
                    onChange={(e) => setDownloadForm({...downloadForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={downloadForm.fileType}
                      onChange={(e) => setDownloadForm({...downloadForm, fileType: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="PDF">PDF</option>
                      <option value="DOC">DOC</option>
                      <option value="XLSX">XLSX</option>
                      <option value="PPT">PPT</option>
                    </select>
                    <input
                      type="text"
                      placeholder="File Size (e.g., 2.5 MB)"
                      value={downloadForm.fileSize}
                      onChange={(e) => setDownloadForm({...downloadForm, fileSize: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Category"
                    value={downloadForm.category}
                    onChange={(e) => setDownloadForm({...downloadForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    placeholder="Description..."
                    value={downloadForm.description}
                    onChange={(e) => setDownloadForm({...downloadForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                </>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSave} className="btn-primary flex items-center">
                  <Save size={18} className="mr-2" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentManagement;
