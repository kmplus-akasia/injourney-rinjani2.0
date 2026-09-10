import React, { useState } from 'react';
import { ChevronLeft, Users, Clock, GraduationCap, TrendingUp, BarChart3, PieChart, Calendar, ChevronDown, Filter } from 'lucide-react';
import { Button } from './ui/button';
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsProps {
  onBack: () => void;
}

// Mock data untuk charts
const employeeCountData = [
  { month: 'Jan', total: 245, new: 12, resigned: 5 },
  { month: 'Feb', total: 252, new: 15, resigned: 8 },
  { month: 'Mar', total: 259, new: 18, resigned: 11 },
  { month: 'Apr', total: 266, new: 14, resigned: 7 },
  { month: 'May', total: 273, new: 16, resigned: 9 },
  { month: 'Jun', total: 280, new: 19, resigned: 12 },
  { month: 'Jul', total: 287, new: 21, resigned: 14 },
  { month: 'Aug', total: 294, new: 17, resigned: 10 },
  { month: 'Sep', total: 301, new: 20, resigned: 13 },
  { month: 'Oct', total: 308, new: 18, resigned: 11 },
  { month: 'Nov', total: 315, new: 22, resigned: 15 },
  { month: 'Dec', total: 322, new: 19, resigned: 12 }
];

const tenureData = [
  { range: '< 1 tahun', count: 45, percentage: 14 },
  { range: '1-3 tahun', count: 89, percentage: 28 },
  { range: '3-5 tahun', count: 72, percentage: 22 },
  { range: '5-10 tahun', count: 68, percentage: 21 },
  { range: '> 10 tahun', count: 48, percentage: 15 }
];

const educationData = [
  { level: 'S3/Doktor', count: 8, color: 'var(--chart-1)' },
  { level: 'S2/Master', count: 52, color: 'var(--chart-5)' },
  { level: 'S1/Bachelor', count: 186, color: 'var(--chart-2)' },
  { level: 'D3/Diploma', count: 48, color: 'var(--chart-3)' },
  { level: 'SMA/SMK', count: 28, color: 'var(--chart-4)' }
];

const departmentData = [
  { name: 'Human Capital', employees: 45 },
  { name: 'Technology', employees: 78 },
  { name: 'Finance', employees: 32 },
  { name: 'Operations', employees: 95 },
  { name: 'Marketing', employees: 42 },
  { name: 'Sales', employees: 30 }
];

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)', 'var(--chart-1)'];

// Dummy data untuk branch
const BRANCH_DATA = [
  { value: 'all', label: 'All Branches' },
  { value: 'jakarta', label: 'Jakarta - Head Office' },
  { value: 'surabaya', label: 'Surabaya Branch' },
  { value: 'bandung', label: 'Bandung Branch' },
  { value: 'medan', label: 'Medan Branch' },
  { value: 'bali', label: 'Bali Branch' },
  { value: 'makassar', label: 'Makassar Branch' },
];

export default function Analytics({ onBack }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'tenure' | 'education'>('overview');
  const [dateRange, setDateRange] = useState('Feb 2025 - Jan 2026');
  const [employeeStatus, setEmployeeStatus] = useState('all-active');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  
  // Separate states for temporary (UI) filters and applied filters
  const [tempFilters, setTempFilters] = useState<{
    dateRange?: string;
    employeeStatus?: string;
    branch?: string;
    organization?: string;
    jobLevel?: string;
    jobPosition?: string;
    startDate?: string;
    endDate?: string;
  }>({
    dateRange: 'Feb 2025 - Jan 2026',
    employeeStatus: 'all-active',
    startDate: '2025-02-01',
    endDate: '2026-01-31'
  });
  
  const [appliedFilters, setAppliedFilters] = useState<{
    dateRange?: string;
    employeeStatus?: string;
    branch?: string;
    organization?: string;
    jobLevel?: string;
    jobPosition?: string;
    startDate?: string;
    endDate?: string;
  }>({
    dateRange: 'Feb 2025 - Jan 2026',
    employeeStatus: 'all-active',
    startDate: '2025-02-01',
    endDate: '2026-01-31'
  });
  
  // Apply filters handler
  const handleApplyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    setDateRange(tempFilters.dateRange || 'Feb 2025 - Jan 2026');
    setEmployeeStatus(tempFilters.employeeStatus || 'all-active');
    setShowFilterMenu(false);
  };
  
  // Reset filters handler
  const handleResetFilters = () => {
    const defaultFilters = {
      dateRange: 'Feb 2025 - Jan 2026',
      employeeStatus: 'all-active'
    };
    setTempFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setDateRange('Feb 2025 - Jan 2026');
    setEmployeeStatus('all-active');
  };

  // Calculate filtered statistics based on APPLIED filters
  const getFilteredStatistics = () => {
    // Base statistics
    let total = 322;
    let newHires = 19;
    let resignations = 12;
    let tenure = 4.2;
    
    // Apply employee status filter
    switch (appliedFilters.employeeStatus) {
      case 'new-hire':
        total = newHires;
        newHires = newHires;
        resignations = 0;
        tenure = 0.3;
        break;
      case 'current':
        total = total - newHires;
        newHires = 0;
        resignations = resignations;
        tenure = 5.1;
        break;
      case 'resigned':
        total = resignations;
        newHires = 0;
        resignations = resignations;
        tenure = 3.8;
        break;
      default:
        // all-active - use base values
        break;
    }
    
    // Apply additional filters (reduce by small percentage for demo)
    const filterCount = Object.keys(appliedFilters).length;
    if (filterCount > 0) {
      const reduction = filterCount * 0.15; // 15% reduction per filter
      total = Math.round(total * (1 - reduction));
      newHires = Math.round(newHires * (1 - reduction));
      resignations = Math.round(resignations * (1 - reduction));
    }
    
    return { total, newHires, resignations, tenure };
  };
  
  const stats = getFilteredStatistics();
  const totalEmployees = stats.total;
  const newHiresThisMonth = stats.newHires;
  const resignationsThisMonth = stats.resignations;
  const avgTenure = stats.tenure;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Button
              variant="ghost"
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
              Back
            </Button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <BarChart3 style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
            <h1 style={{ color: 'var(--foreground)' }}>Analytics Dashboard</h1>
          </div>
          <p className="caption" style={{ color: 'var(--muted-foreground)' }}>
            Analisis data pegawai, masa kerja, dan pendidikan
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', paddingLeft: '32px', paddingRight: '32px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'overview' ? 'var(--background)' : 'transparent',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--muted-foreground)',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'overview' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'employees' ? 'var(--background)' : 'transparent',
              color: activeTab === 'employees' ? 'var(--primary)' : 'var(--muted-foreground)',
              border: 'none',
              borderBottom: activeTab === 'employees' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'employees' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab('tenure')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'tenure' ? 'var(--background)' : 'transparent',
              color: activeTab === 'tenure' ? 'var(--primary)' : 'var(--muted-foreground)',
              border: 'none',
              borderBottom: activeTab === 'tenure' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'tenure' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Masa Kerja
          </button>
          <button
            onClick={() => setActiveTab('education')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'education' ? 'var(--background)' : 'transparent',
              color: activeTab === 'education' ? 'var(--primary)' : 'var(--muted-foreground)',
              border: 'none',
              borderBottom: activeTab === 'education' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'education' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            Pendidikan
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px' }}>
        {/* Filter Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)'
        }}>
          {/* Date Range Picker */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={dateRange}
              readOnly
              placeholder="Select date range"
              className="font-['Inter',sans-serif]"
              style={{
                padding: '8px 36px 8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)',
                cursor: 'pointer',
                minWidth: '200px',
              }}
            />
            <Calendar 
              size={16} 
              style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
                pointerEvents: 'none'
              }} 
            />
          </div>

          {/* Employee Status Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={tempFilters.employeeStatus || 'all-active'}
              onChange={(e) => setTempFilters({ ...tempFilters, employeeStatus: e.target.value })}
              className="font-['Inter',sans-serif]"
              style={{
                padding: '8px 36px 8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)',
                cursor: 'pointer',
                appearance: 'none',
                minWidth: '180px',
              }}
            >
              <option value="all-active">All active employee</option>
              <option value="new-hire">New hire</option>
              <option value="current">Current employee</option>
              <option value="resigned">Resigned</option>
            </select>
            <ChevronDown 
              size={16} 
              style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
                pointerEvents: 'none'
              }} 
            />
          </div>

          {/* Branch Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={tempFilters.branch || 'all'}
              onChange={(e) => setTempFilters({ ...tempFilters, branch: e.target.value })}
              className="font-['Inter',sans-serif]"
              style={{
                padding: '8px 36px 8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)',
                cursor: 'pointer',
                appearance: 'none',
                minWidth: '200px',
              }}
            >
              {BRANCH_DATA.map((branch) => (
                <option key={branch.value} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
            <ChevronDown 
              size={16} 
              style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
                pointerEvents: 'none'
              }} 
            />
          </div>

          {/* Select Filter Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="font-['Inter',sans-serif]"
              style={{
                padding: '8px 36px 8px 12px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--input-background)',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-normal)',
                cursor: 'pointer',
                minWidth: '150px',
                textAlign: 'left',
              }}
            >
              Select Filter
            </button>
            <ChevronDown 
              size={16} 
              style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--muted-foreground)',
                pointerEvents: 'none'
              }} 
            />
            
            {/* Filter Menu Dropdown */}
            {showFilterMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0px 4px 6px -2px rgba(0,0,0,0.05), 0px 10px 15px -3px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  minWidth: '150px',
                }}
              >
                {[
                  { label: 'Branch', value: 'branch' },
                  { label: 'Organization', value: 'organization' },
                  { label: 'Job Level', value: 'jobLevel' },
                  { label: 'Job Position', value: 'jobPosition' },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    className="font-['Inter',sans-serif]"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--foreground)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-weight-normal)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {filter.label}
                    <ChevronDown 
                      size={14} 
                      style={{ 
                        transform: 'rotate(-90deg)',
                        color: 'var(--muted-foreground)'
                      }} 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Apply Filter Button */}
          <button
            className="font-['Inter',sans-serif]"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onClick={handleApplyFilters}
          >
            Apply filter
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Total Pegawai</span>
              <Users size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)' }}>{totalEmployees}</div>
            <div style={{ fontSize: '12px', color: 'var(--success)', marginTop: '4px' }}>+2.3% dari bulan lalu</div>
          </div>

          <div style={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Pegawai Baru</span>
              <TrendingUp size={20} style={{ color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)' }}>{newHiresThisMonth}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Bulan ini</div>
          </div>

          <div style={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Resign</span>
              <TrendingUp size={20} style={{ color: 'var(--destructive)', transform: 'rotate(180deg)' }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)' }}>{resignationsThisMonth}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Bulan ini</div>
          </div>

          <div style={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Rata-rata Masa Kerja</span>
              <Clock size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)' }}>{avgTenure}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Tahun</div>
          </div>
        </div>

        {/* Charts Section */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            {/* Employee Growth Chart */}
            <div style={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)', 
              padding: '24px'
            }}>
              <h3 style={{ color: 'var(--foreground)', marginBottom: '16px', fontWeight: 600 }}>
                Pertumbuhan Pegawai 2026
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={employeeCountData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="total" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} name="Total Pegawai" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Education Distribution */}
            <div style={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)', 
              padding: '24px'
            }}>
              <h3 style={{ color: 'var(--foreground)', marginBottom: '16px', fontWeight: 600 }}>
                Distribusi Pendidikan
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={educationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ level, percent }) => `${level}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="var(--chart-1)"
                    dataKey="count"
                  >
                    {educationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            {/* Tenure Distribution */}
            <div style={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)', 
              padding: '24px'
            }}>
              <h3 style={{ color: 'var(--foreground)', marginBottom: '16px', fontWeight: 600 }}>
                Distribusi Masa Kerja
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tenureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="range" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill="var(--chart-2)" name="Jumlah Pegawai" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Distribution */}
            <div style={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)', 
              padding: '24px'
            }}>
              <h3 style={{ color: 'var(--foreground)', marginBottom: '16px', fontWeight: 600 }}>
                Pegawai per Department
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" />
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Bar dataKey="employees" name="Jumlah Pegawai">
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div style={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            padding: '24px'
          }}>
            <h3 style={{ color: 'var(--foreground)', marginBottom: '16px', fontWeight: 600 }}>
              Tren Pegawai Baru vs Resign
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={employeeCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="new" stroke="var(--chart-2)" strokeWidth={2} name="Pegawai Baru" />
                <Line type="monotone" dataKey="resigned" stroke="var(--chart-4)" strokeWidth={2} name="Resign" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'tenure' && (
          <div style={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            padding: '24px'
          }}>
            <h3 style={{ color: 'var(--foreground)', marginBottom: '16px', fontWeight: 600 }}>
              Detail Distribusi Masa Kerja
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={tenureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="range" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="var(--chart-1)" name="Jumlah Pegawai" />
              </BarChart>
            </ResponsiveContainer>

            {/* Table */}
            <div style={{ marginTop: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--foreground)' }}>Masa Kerja</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--foreground)' }}>Jumlah</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--foreground)' }}>Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {tenureData.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', color: 'var(--foreground)' }}>{item.range}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--foreground)' }}>{item.count}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--foreground)' }}>{item.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div style={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)', 
              padding: '24px'
            }}>
              <h3 style={{ color: 'var(--foreground)', marginBottom: '16px', fontWeight: 600 }}>
                Distribusi Tingkat Pendidikan
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <RePieChart>
                  <Pie
                    data={educationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ level, count }) => `${level}: ${count}`}
                    outerRadius={120}
                    fill="var(--chart-1)"
                    dataKey="count"
                  >
                    {educationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ 
              backgroundColor: 'var(--card)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)', 
              padding: '24px'
            }}>
              <h3 style={{ color: 'var(--foreground)', marginBottom: '16px', fontWeight: 600 }}>
                Detail Pendidikan
              </h3>
              <div style={{ marginTop: '24px' }}>
                {educationData.map((item, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderBottom: index < educationData.length - 1 ? '1px solid var(--border)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          backgroundColor: item.color 
                        }}
                      />
                      <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{item.level}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '18px' }}>
                        {item.count}
                      </div>
                      <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                        pegawai
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}