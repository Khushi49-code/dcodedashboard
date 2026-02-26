"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Briefcase, DollarSign, Clock, Save, X, Eye, EyeOff } from 'lucide-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import db from '../../lib/firebaseClient';

type Job = {
  id: string;
  title: string;
  experience: string;
  description: string;
  link: string;
  salary?: string;
  skills: string[];
  education: string[];
  isActive: boolean;
  createdAt?: { toDate?: () => Date } | Date;
  updatedAt?: { toDate?: () => Date } | Date;
};

const JobManagementDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', 
    experience: '', 
    description: '', 
    link: '', 
    salary: '',
    skills: [''],
    education: [''],
    isActive: true
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const jobsData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        skills: [],
        education: [],
        isActive: true,
        ...doc.data() 
      }));
      setJobs(jobsData as Job[]);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const resetForm = () => setFormData({ 
    title: '', 
    experience: '', 
    description: '', 
    link: '', 
    salary: '',
    skills: [''],
    education: [''],
    isActive: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleJobVisibility = async (jobId: string, currentStatus: boolean) => {
    try {
      setUpdatingVisibility(jobId);
      const newStatus = !currentStatus;
      
      await updateDoc(doc(db, 'jobs', jobId), { 
        isActive: newStatus,
        updatedAt: serverTimestamp() 
      });
      
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, isActive: newStatus, updatedAt: new Date() } 
          : job
      ));
      
      console.log(`Job ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error(err);
      alert('Failed to update job visibility.');
    } finally {
      setUpdatingVisibility(null);
    }
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkillField = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkillField = (index: number) => {
    if (formData.skills.length > 1) {
      const newSkills = formData.skills.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, skills: newSkills }));
    }
  };

  const handleEducationChange = (index: number, value: string) => {
    const newEducation = [...formData.education];
    newEducation[index] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const addEducationField = () => {
    setFormData(prev => ({ ...prev, education: [...prev.education, ''] }));
  };

  const removeEducationField = (index: number) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, education: newEducation }));
    }
  };

  const handleSubmit = async () => {
    const filteredSkills = formData.skills.filter(skill => skill.trim() !== '');
    const filteredEducation = formData.education.filter(degree => degree.trim() !== '');

    const submitData = {
      ...formData,
      skills: filteredSkills,
      education: filteredEducation
    };

    if (!submitData.title || !submitData.experience || !submitData.description || !submitData.link) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      if (editingJob) {
        await updateDoc(doc(db, 'jobs', editingJob.id), { 
          ...submitData, 
          updatedAt: serverTimestamp() 
        });
        setJobs(prev => prev.map(job => job.id === editingJob.id ? 
          { ...job, ...submitData, updatedAt: new Date() } : job
        ));
        setEditingJob(null);
      } else {
        const docRef = await addDoc(collection(db, 'jobs'), { 
          ...submitData, 
          createdAt: serverTimestamp() 
        });
        setJobs(prev => [{ id: docRef.id, ...submitData, createdAt: new Date() }, ...prev]);
      }
      resetForm();
      setIsAddingJob(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save job.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job: Job) => {
    setFormData({ 
      title: job.title, 
      experience: job.experience, 
      description: job.description, 
      link: job.link, 
      salary: job.salary || '',
      skills: job.skills && job.skills.length > 0 ? job.skills : [''],
      education: job.education && job.education.length > 0 ? job.education : [''],
      isActive: job.isActive !== undefined ? job.isActive : true
    });
    setEditingJob(job);
    setIsAddingJob(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'jobs', id));
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete job.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsAddingJob(false);
    setEditingJob(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">Job Dashboard</h1>
          </div>
          <button
            onClick={() => setIsAddingJob(true)}
            disabled={loading || isAddingJob}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> <span>Add Job</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white p-3 rounded border shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-800">{jobs.length}</div>
            <div className="text-sm text-gray-600">Total Jobs</div>
          </div>
          <div className="bg-white p-3 rounded border shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">
              {jobs.filter(job => job.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Jobs</div>
          </div>
          <div className="bg-white p-3 rounded border shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-400">
              {jobs.filter(job => !job.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Inactive Jobs</div>
          </div>
        </div>

        {/* Enhanced Form */}
        {isAddingJob && (
          <div className="bg-white p-4 rounded mb-4 border shadow-sm">
            <h2 className="text-lg font-medium mb-4 border-b pb-2">
              {editingJob ? 'Edit Job' : 'Add New Job'}
            </h2>
            
            <div className="space-y-4">
              {/* Visibility Toggle in Form */}
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${formData.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${formData.isActive ? 'translate-x-6' : ''}`}></div>
                </div>
                <span className="text-sm font-medium">
                  {formData.isActive ? 'Active (Visible to users)' : 'Inactive (Hidden from users)'}
                </span>
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="font-medium mb-2 text-gray-700">Basic Information *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    placeholder="Job Title *" 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    name="experience" 
                    value={formData.experience} 
                    onChange={handleInputChange} 
                    placeholder="Experience Level *" 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    name="salary" 
                    value={formData.salary} 
                    onChange={handleInputChange} 
                    placeholder="Salary Range (optional)" 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    name="link" 
                    value={formData.link} 
                    onChange={handleInputChange} 
                    placeholder="Application Link *" 
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Job Description *" 
                  rows={4}
                  className="w-full p-2 border rounded mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Skills Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">Required Skills</h3>
                  <button
                    type="button"
                    onClick={addSkillField}
                    className="flex items-center space-x-1 text-sm bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  >
                    <Plus className="h-3 w-3" /> <span>Add Skill</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        value={skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        placeholder={`Skill ${index + 1}`}
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSkillField(index)}
                          className="bg-red-100 text-red-600 px-3 rounded hover:bg-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-700">Education Requirements</h3>
                  <button
                    type="button"
                    onClick={addEducationField}
                    className="flex items-center space-x-1 text-sm bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  >
                    <Plus className="h-3 w-3" /> <span>Add Degree</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.education.map((degree, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        value={degree}
                        onChange={(e) => handleEducationChange(index, e.target.value)}
                        placeholder={`Degree name ${index + 1}`}
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducationField(index)}
                          className="bg-red-100 text-red-600 px-3 rounded hover:bg-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {"Add degree requirements (e.g., \"Bachelor's in Computer Science\")"}
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-2 mt-4 pt-4 border-t">
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{editingJob ? 'Update Job' : 'Add Job'}</span>
              </button>
              <button 
                onClick={handleCancel}
                className="flex items-center space-x-1 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Job List */}
        <div className="bg-white rounded border shadow-sm">
          {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
          {!loading && jobs.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No jobs found. Add your first job posting!</p>
            </div>
          )}
          {!loading && jobs.map(job => (
            <div key={job.id} className={`p-4 border-b hover:bg-gray-50 ${!job.isActive ? 'bg-gray-50 opacity-80' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold text-lg ${job.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {job.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                    <span className="flex items-center bg-blue-100 px-2 py-1 rounded">
                      <Clock className="h-3 w-3 mr-1" />
                      {job.experience}
                    </span>
                    {job.salary && (
                      <span className="flex items-center bg-green-100 px-2 py-1 rounded">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {job.salary}
                      </span>
                    )}
                  </div>

                  <p className={`mt-2 line-clamp-2 ${job.isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                    {job.description}
                  </p>

                  {/* Skills Display */}
                  {job.skills && job.skills.length > 0 && job.skills[0] !== '' && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-600">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.skills.map((skill, index) => (
                          <span key={index} className={`px-2 py-1 rounded text-sm ${job.isActive ? 'bg-gray-100' : 'bg-gray-200'}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education Display */}
                  {job.education && job.education.length > 0 && job.education[0] !== '' && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-600">Education:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {job.education.map((degree, index) => (
                          <span key={index} className={`px-2 py-1 rounded text-sm ${job.isActive ? 'bg-purple-100' : 'bg-gray-200'}`}>
                            {degree}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.isActive && (
                    <a 
                      href={job.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center text-blue-600 hover:underline mt-2"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Apply Now
                    </a>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {/* Visibility Toggle Button */}
                  <button 
                    onClick={() => toggleJobVisibility(job.id, job.isActive)}
                    disabled={updatingVisibility === job.id}
                    className={`p-2 rounded ${job.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                    title={job.isActive ? 'Make inactive (hide from users)' : 'Make active (show to users)'}
                  >
                    {updatingVisibility === job.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    ) : job.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleEdit(job)} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit job"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(job.id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete job"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobManagementDashboard;
