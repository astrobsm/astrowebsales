import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Video, Download, Heart, TrendingUp, AlertCircle, Users, CheckCircle, ChevronRight, Play, Clock, FileText, GraduationCap, Star, X, Printer, Share2, ArrowLeft, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';
import { useContentStore } from '../../store/contentStore';
import { useAuthStore } from '../../store/authStore';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const Education = () => {
  const { educationTopics, downloads, videos, training, clinicalApps, getAllArticles, getFeaturedArticles, incrementDownloadCount, resetEducationTopicsToDefault, resetDownloadsToDefault } = useContentStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('articles');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [selectedAppCategory, setSelectedAppCategory] = useState('all');

  // Handle URL params for tab selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['articles', 'videos', 'training', 'downloads', 'apps'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const featuredArticles = getFeaturedArticles();
  const allArticles = getAllArticles();

  // Get unique app categories
  const appCategories = ['all', ...new Set(clinicalApps.map(app => app.category))];

  // Filter apps based on search and category
  const filteredApps = clinicalApps.filter(app => {
    const matchesSearch = appSearchTerm 
      ? app.name.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(appSearchTerm.toLowerCase())
      : true;
    const matchesCategory = selectedAppCategory === 'all' || app.category === selectedAppCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter articles based on search term
  const filteredArticles = searchTerm 
    ? allArticles.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allArticles;

  const getTopicIcon = (icon) => {
    const icons = { '📋': Book, '🦶': Heart, '🛏️': AlertCircle, '🩹': TrendingUp, '🦠': CheckCircle, '📚': Users };
    return icons[icon] || Book;
  };

  // Generate PDF for downloadable resource with company logo
  const handleDownload = async (download) => {
    incrementDownloadCount(download.id);
    
    if (!download.content) {
      toast.success(`Downloading: ${download.title}`);
      return;
    }

    toast.loading('Generating PDF...', { id: 'pdf-download' });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Load and add company logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'Anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/logo.png';
      });

      const canvas = document.createElement('canvas');
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(logoImg, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');

      doc.addImage(logoDataUrl, 'PNG', margin, y, 20, 20);
      doc.setTextColor(40, 125, 77);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Bonnesante Medicals', margin + 25, y + 8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text('Your Trusted Wound Care Partner', margin + 25, y + 14);
      doc.setFontSize(8);
      doc.text('17A Isuofia Street, Federal Housing Estate Trans Ekulu, Enugu', margin + 25, y + 19);
      
      y += 28;
    } catch (error) {
      doc.setFillColor(40, 125, 77);
      doc.rect(margin, y, 20, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('BSM', margin + 4, y + 12);
      doc.setTextColor(40, 125, 77);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Bonnesante Medicals', margin + 25, y + 8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text('Your Trusted Wound Care Partner', margin + 25, y + 14);
      y += 28;
    }

    // Decorative line
    doc.setDrawColor(40, 125, 77);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Document title
    doc.setTextColor(40, 125, 77);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    const titleLines = doc.splitTextToSize(download.title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 7 + 5;

    // Category and date
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Category: ${download.category} | Date: ${download.date}`, margin, y);
    y += 8;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Helper function to sanitize Unicode characters for jsPDF compatibility
    const sanitizeForPDF = (text) => {
      return text
        .replace(/☐/g, '[ ]')
        .replace(/✓/g, '[X]')
        .replace(/✗/g, '[X]')
        .replace(/•/g, '-')
        .replace(/→/g, '->')
        .replace(/←/g, '<-')
        .replace(/↑/g, '^')
        .replace(/↓/g, 'v')
        .replace(/✔/g, '[X]')
        .replace(/✖/g, '[X]')
        .replace(/★/g, '*')
        .replace(/☆/g, '*')
        .replace(/○/g, 'o')
        .replace(/●/g, '*')
        .replace(/◆/g, '*')
        .replace(/◇/g, 'o')
        .replace(/▪/g, '-')
        .replace(/▫/g, '-')
        .replace(/►/g, '>')
        .replace(/◄/g, '<')
        .replace(/─/g, '-')
        .replace(/│/g, '|')
        .replace(/═/g, '=')
        .replace(/━/g, '-')
        .replace(/🚨/g, '!')
        .replace(/⚠/g, '!')
        .replace(/📋/g, '')
        .replace(/📌/g, '')
        .replace(/📁/g, '')
        .replace(/📂/g, '')
        .replace(/📄/g, '')
        .replace(/📝/g, '')
        .replace(/🔴/g, '(!)');
    };

    const content = sanitizeForPDF(download.content || '');
    const lines = content.split('\n');
    
    lines.forEach((line) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }

      if (line.startsWith('**') && line.endsWith('**')) {
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(40, 125, 77);
        const text = line.replace(/\*\*/g, '');
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 5 + 4;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
      } else if (line.match(/^[=\-]{3,}$/)) {
        // Decorative horizontal lines (sanitized from ═ or ━)
        doc.setDrawColor(40, 125, 77);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      } else if (line.startsWith('- ') || line.startsWith('[ ] ') || line.startsWith('[X] ')) {
        // Checkbox or bullet items - indent and format nicely
        const textLines = doc.splitTextToSize(line, contentWidth - 10);
        doc.text(textLines, margin + 5, y);
        y += textLines.length * 4.5 + 1;
      } else if (line.match(/^\d+\.\s/)) {
        const textLines = doc.splitTextToSize(line, contentWidth - 10);
        doc.text(textLines, margin + 5, y);
        y += textLines.length * 4.5 + 1;
      } else if (line.startsWith('|')) {
        doc.setFontSize(8);
        const textLines = doc.splitTextToSize(line, contentWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 3.5 + 1;
        doc.setFontSize(10);
      } else if (line.startsWith('!') && (line.includes('WARNING') || line.includes('CRITICAL') || line.includes('ALERT') || line.includes('IMPORTANT'))) {
        // Alert/warning lines (sanitized from 🚨)
        doc.setFontSize(10);
        doc.setTextColor(200, 0, 0);
        doc.setFont(undefined, 'bold');
        const textLines = doc.splitTextToSize(line, contentWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 4.5 + 2;
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
      } else if (line.trim() === '') {
        y += 3;
      } else {
        const cleanLine = line.replace(/\*\*/g, '');
        const textLines = doc.splitTextToSize(cleanLine, contentWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 4.5 + 1;
      }
    });

    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(40, 125, 77);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('© 2026 Bonnesante Medicals | 17A Isuofia Street, Trans Ekulu, Enugu', margin, pageHeight - 12);
      doc.text('Tel: +234 902 872 4839, +234 702 575 5406 | Email: astrobsm@gmail.com', margin, pageHeight - 8);
      doc.setTextColor(40, 125, 77);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    doc.save(`Bonnesante_${download.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    toast.success('PDF downloaded successfully!', { id: 'pdf-download' });
  };

  // Generate PDF for article with company logo
  const downloadArticlePDF = async (article) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;

    // Load and add company logo
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'Anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
        logoImg.src = '/logo.png';
      });

      // Create canvas to convert image to base64
      const canvas = document.createElement('canvas');
      canvas.width = logoImg.width;
      canvas.height = logoImg.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(logoImg, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');

      // Add logo to PDF (20x20mm at top left)
      doc.addImage(logoDataUrl, 'PNG', margin, y, 20, 20);
      
      // Header text next to logo
      doc.setTextColor(40, 125, 77);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Bonnesante Medicals', margin + 25, y + 8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text('Your Trusted Wound Care Partner', margin + 25, y + 14);
      doc.setFontSize(8);
      doc.text('17A Isuofia Street, Federal Housing Estate Trans Ekulu, Enugu', margin + 25, y + 19);
      
      y += 28;
    } catch (error) {
      // Fallback if logo fails to load
      doc.setFillColor(40, 125, 77);
      doc.rect(margin, y, 20, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('BSM', margin + 4, y + 12);

      doc.setTextColor(40, 125, 77);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Bonnesante Medicals', margin + 25, y + 8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.text('Your Trusted Wound Care Partner', margin + 25, y + 14);
      
      y += 28;
    }

    // Decorative line
    doc.setDrawColor(40, 125, 77);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    const titleLines = doc.splitTextToSize(article.title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 8 + 5;

    // Meta info
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`By ${article.author} | ${article.category} | ${article.readTime} read | ${article.date}`, margin, y);
    y += 10;

    // Divider
    doc.setDrawColor(40, 125, 77);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Process content - handle markdown-style formatting
    const content = article.content || '';
    const lines = content.split('\n');
    
    lines.forEach((line) => {
      // Check if we need a new page
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }

      if (line.startsWith('**') && line.endsWith('**')) {
        // Bold header
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        const text = line.replace(/\*\*/g, '');
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 5 + 3;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
      } else if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('✓ ')) {
        // Bullet points
        const text = line.replace(/^[-•✓]\s*/, '');
        const textLines = doc.splitTextToSize(`• ${text}`, contentWidth - 10);
        doc.text(textLines, margin + 5, y);
        y += textLines.length * 5 + 2;
      } else if (line.match(/^\d+\.\s/)) {
        // Numbered list
        const textLines = doc.splitTextToSize(line, contentWidth - 10);
        doc.text(textLines, margin + 5, y);
        y += textLines.length * 5 + 2;
      } else if (line.trim() === '') {
        y += 3;
      } else {
        // Regular paragraph
        const cleanLine = line.replace(/\*\*/g, '');
        const textLines = doc.splitTextToSize(cleanLine, contentWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 5 + 2;
      }
    });

    // References if available
    if (article.references && article.references.length > 0) {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = margin;
      }
      y += 10;
      doc.setDrawColor(40, 125, 77);
      doc.setLineWidth(0.5);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 125, 77);
      doc.text('References:', margin, y);
      y += 7;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      article.references.forEach((ref, idx) => {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = margin;
        }
        const refLines = doc.splitTextToSize(`${idx + 1}. ${ref}`, contentWidth);
        doc.text(refLines, margin, y);
        y += refLines.length * 4 + 2;
      });
    }

    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(40, 125, 77);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
      
      // Footer text
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(
        '© 2026 Bonnesante Medicals | 17A Isuofia Street, Trans Ekulu, Enugu',
        margin,
        pageHeight - 12
      );
      doc.text(
        'Tel: +234 902 872 4839, +234 702 575 5406 | Email: astrobsm@gmail.com',
        margin,
        pageHeight - 8
      );
      
      // Page number
      doc.setTextColor(40, 125, 77);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    doc.save(`Bonnesante_${article.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    toast.success('Article downloaded as PDF with company branding');
  };

  // Article Detail View
  const ArticleDetail = ({ article, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <button onClick={onClose} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Articles
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => downloadArticlePDF(article)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {article.category}
            </span>
            {article.featured && (
              <span className="inline-block ml-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Featured
              </span>
            )}
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
            <span>By {article.author}</span>
            <span>•</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{article.readTime} read</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n').map((paragraph, idx) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <h3 key={idx} className="text-xl font-bold text-gray-900 mt-6 mb-3">{paragraph.replace(/\*\*/g, '')}</h3>;
              } else if (paragraph.startsWith('- ') || paragraph.startsWith('• ') || paragraph.startsWith('✓ ')) {
                return <li key={idx} className="ml-6 mb-1 text-gray-700">{paragraph.replace(/^[-•✓]\s*/, '')}</li>;
              } else if (paragraph.match(/^\d+\.\s/)) {
                return <li key={idx} className="ml-6 mb-1 text-gray-700 list-decimal">{paragraph}</li>;
              } else if (paragraph.trim() === '') {
                return <br key={idx} />;
              } else {
                // Handle inline bold text
                const parts = paragraph.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={idx} className="text-gray-700 mb-3 leading-relaxed">
                    {parts.map((part, i) => 
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </p>
                );
              }
            })}
          </div>
          {article.references && article.references.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-lg font-bold text-gray-900 mb-4">References</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                {article.references.map((ref, idx) => (
                  <li key={idx}>{ref}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Topic Articles View
  const TopicArticles = ({ topic, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={onClose} className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div className="flex items-center">
              <span className="text-3xl mr-3">{topic.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{topic.title}</h2>
                <p className="text-sm text-gray-500">{topic.articles?.length || 0} Articles</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <p className="text-gray-600 mb-6">{topic.description}</p>
          <div className="space-y-4">
            {(topic.articles || []).map((article) => (
              <div 
                key={article.id} 
                onClick={() => { setSelectedArticle(article); setSelectedTopic(null); }}
                className="card p-5 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {article.category}
                      </span>
                      {article.featured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{article.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.readTime}
                      <span className="mx-2">•</span>
                      {article.author}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="Bonnesante Medicals" className="w-16 h-16 object-contain bg-white rounded-full p-2" />
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Health Education Hub
              </h1>
              <p className="text-xl text-primary-100 mt-2">
                Free wound care resources for healthcare professionals. Articles, videos, 
                training courses, and downloadable guides to enhance your practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'articles', label: 'Articles', icon: Book },
              { id: 'videos', label: 'Videos', icon: Video },
              { id: 'training', label: 'Training', icon: GraduationCap },
              { id: 'downloads', label: 'Downloads', icon: Download },
              { id: 'apps', label: 'Clinical Apps', icon: Smartphone }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <>
          {/* Search Section */}
          <section className="py-8 bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative max-w-xl">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles by title, category, or keyword..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <Book className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="mt-3 text-sm text-gray-600">
                  Found {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} matching "{searchTerm}"
                </p>
              )}
            </div>
          </section>

          {/* Featured Articles */}
          <section className="py-12 bg-primary-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Featured Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredArticles.slice(0, 3).map((article) => (
                  <div 
                    key={article.id} 
                    onClick={() => setSelectedArticle(article)}
                    className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <span className="inline-block px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-medium mb-3">
                      Featured
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </span>
                      <span>{article.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Topics Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900">Browse by Topic</h2>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => {
                      resetEducationTopicsToDefault();
                      resetDownloadsToDefault();
                      toast.success('Education content refreshed! New topics loaded.');
                      window.location.reload();
                    }}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Topics
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {educationTopics.map((topic) => (
                  <div 
                    key={topic.id} 
                    onClick={() => setSelectedTopic(topic)}
                    className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="flex items-start">
                      <div className="text-4xl mr-4">{topic.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                        <div className="flex items-center text-primary-600 text-sm font-medium">
                          {topic.articles?.length || topic.articleCount || 0} Articles
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* All Articles */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  {searchTerm ? 'Search Results' : 'Latest Articles'}
                </h2>
                <span className="text-sm text-gray-500">
                  {(searchTerm ? filteredArticles : allArticles).length} articles
                </span>
              </div>
              <div className="space-y-4">
                {(searchTerm ? filteredArticles : allArticles).slice(0, 15).map((article) => (
                  <div 
                    key={article.id} 
                    onClick={() => setSelectedArticle(article)}
                    className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                            {article.category}
                          </span>
                          {article.featured && (
                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">{article.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <span>By {article.author}</span>
                          <span className="mx-2">•</span>
                          <span>{article.date}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col items-end text-sm text-gray-500 ml-4">
                        <span className="flex items-center mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          {article.readTime}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {(searchTerm ? filteredArticles : allArticles).length > 15 && (
                <div className="text-center mt-8">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Load More Articles
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-8">Video Tutorials</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {videos.map((video) => (
                <div key={video.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-gray-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium mb-2">
                      {video.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{video.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{video.views.toLocaleString()} views</span>
                      <span className="mx-2">•</span>
                      <span>{video.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-8">Training Courses</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {training.map((course) => (
                <div key={course.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                    <GraduationCap className="w-20 h-20 text-white/50" />
                  </div>
                  <div className="p-6">
                    {course.featured && (
                      <span className="inline-block px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-medium mb-2">
                        Featured
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        {course.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Book className="w-4 h-4 mr-2" />
                        {course.modules} modules
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        {course.students} students enrolled
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                          course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {course.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">{course.rating}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-bold ${course.price === 'Free' ? 'text-green-600' : 'text-primary-700'}`}>
                        {course.price}
                      </span>
                      <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Downloads Tab */}
      {activeTab === 'downloads' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-8">Downloadable Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {downloads.map((download) => (
                <div key={download.id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs mb-2">
                        {download.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{download.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{download.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>{download.fileType} • {download.fileSize}</span>
                          <span>{download.downloads.toLocaleString()} downloads</span>
                        </div>
                        <button 
                          onClick={() => handleDownload(download)}
                          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clinical Apps Tab */}
      {activeTab === 'apps' && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Apps Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Clinical Apps for Wound Care</h2>
              <p className="text-gray-600">
                Recommended mobile and web applications to enhance your wound care practice
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={appSearchTerm}
                  onChange={(e) => setAppSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {appCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedAppCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedAppCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Apps Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => (
                <div key={app.id} className="card p-6 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-4xl mr-3">{app.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {app.name}
                        </h3>
                        <span className="text-xs text-gray-500">{app.category}</span>
                      </div>
                    </div>
                    {app.featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{app.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Smartphone className="w-4 h-4 mr-1" />
                      {app.platform}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{app.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className={`text-sm font-medium ${app.price === 'Free' ? 'text-green-600' : 'text-gray-700'}`}>
                      {app.price}
                    </span>
                    <div className="flex gap-2">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Open App
                      </a>
                      {app.iosUrl && (
                        <a
                          href={app.iosUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          iOS
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredApps.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No apps found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* App Suggestion CTA */}
            <div className="mt-12 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Know a great clinical app?</h3>
              <p className="text-gray-600 mb-4">
                Help fellow healthcare professionals by suggesting useful apps for wound care
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Suggest an App
                <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            Advance Your Wound Care Knowledge
          </h2>
          <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who have enhanced their practice 
            with our educational resources. Free seminars, certified training, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/seminars"
              className="inline-flex items-center justify-center bg-white text-primary-700 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              View Seminars
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/contact"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <ArticleDetail 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}

      {/* Topic Articles Modal */}
      {selectedTopic && (
        <TopicArticles 
          topic={selectedTopic} 
          onClose={() => setSelectedTopic(null)} 
        />
      )}
    </div>
  );
};

export default Education;
