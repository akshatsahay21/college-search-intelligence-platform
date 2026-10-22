import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle } from 'lucide-react';

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('5');
  const [type, setType] = useState('notes');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('department', department);
    formData.append('semester', semester);
    formData.append('type', type);

    try {
      const token = sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/documents/upload', formData, {
        headers: { 
          
          'Authorization': `Bearer ${token}`
        },
      });
      setSuccess(true);
      setFile(null);
      setTitle('');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || 'Upload failed. See console for details.'; alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-12 border border-slate-200">
      <h1 className="text-3xl font-bold text-primary mb-6">Upload Document</h1>
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
          <CheckCircle className="w-5 h-5" />
          Document processed and AI vectors generated successfully!
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-secondary mb-1">Document Title</label>
          <input 
            type="text" 
            required 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., DBMS Unit 3 Notes"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-1">Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-1">Semester</label>
            <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              {
[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-secondary mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="notes">Notes</option>
              <option value="pyq">PYQ</option>
              <option value="syllabus">Syllabus</option>
              <option value="notice">Notice</option>
            </select>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
          <UploadCloud className="w-12 h-12 text-primary mx-auto mb-3" />
          <input 
            type="file" 
            accept="application/pdf"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="hidden" 
            id="file-upload" 
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-primary font-semibold hover:underline">Click to upload PDF</span> or drag and drop
          </label>
          {file && <p className="mt-2 text-sm text-secondary font-medium">Selected: {file.name}</p>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing via AI...' : 'Upload & Process'}
        </button>
      </form>
    </div>
  );
}