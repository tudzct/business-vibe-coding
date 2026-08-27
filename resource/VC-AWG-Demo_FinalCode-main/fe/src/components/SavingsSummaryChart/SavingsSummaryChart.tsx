import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { savingsService } from '../../api/savings.service'
import { SavingsSummaryResponse, MonthlySavings } from '../../api/types'
import { formatCurrency } from '../../utils/format'

/**
 * Component hiển thị biểu đồ đường tổng hợp tiết kiệm theo tháng
 */
const SavingsSummaryChart: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [chartData, setChartData] = useState<{
    this_year: MonthlySavings[]
    last_year: MonthlySavings[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Lấy dữ liệu tổng hợp tiết kiệm từ API
   */
  const fetchSavingsSummary = async (year: number) => {
    try {
      setIsLoading(true)
      setError(null)

      const response: SavingsSummaryResponse = await savingsService.getSavingsSummary(year)

      // Kiểm tra nếu cả hai mảng đều rỗng
      const hasThisYearData = response.summary.this_year.some((item) => item.amount !== 0)
      const hasLastYearData = response.summary.last_year.some((item) => item.amount !== 0)

      if (!hasThisYearData && !hasLastYearData) {
        setError('Transaction data for this year is not yet available to calculate savings.')
        setChartData(null)
        return
      }

      // Cập nhật state với dữ liệu nhận được
      setChartData({
        this_year: response.summary.this_year,
        last_year: response.summary.last_year,
      })
    } catch (err: any) {
      // Xử lý lỗi API
      const errorMessage =
        err.response?.data?.message ||
        'Failed to load data. Please try again later.'
      setError(errorMessage)
      setChartData(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Gọi API mỗi khi selectedYear thay đổi
  useEffect(() => {
    fetchSavingsSummary(selectedYear)
  }, [selectedYear])

  /**
   * Tạo dữ liệu cho biểu đồ từ API response
   * Chuyển đổi format từ {month: "01", amount: 1500000} sang {name: "Jan", thisYear: 1500000, lastYear: 1200000}
   */
  const prepareChartData = () => {
    if (!chartData) return []

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return monthNames.map((monthName, index) => {
      const monthNumber = (index + 1).toString().padStart(2, '0')
      
      const thisYearItem = chartData.this_year.find((item) => item.month === monthNumber)
      const lastYearItem = chartData.last_year.find((item) => item.month === monthNumber)

      return {
        name: monthName,
        thisYear: thisYearItem?.amount || 0,
        lastYear: lastYearItem?.amount || 0,
      }
    })
  }

  /**
   * Tạo danh sách các năm để hiển thị trong dropdown
   */
  const getYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear()
    const years: number[] = []
    // Tạo danh sách từ năm hiện tại trở về trước 10 năm
    for (let i = 0; i <= 10; i++) {
      years.push(currentYear - i)
    }
    return years
  }

  /**
   * Render skeleton loader cho biểu đồ
   */
  const renderChartSkeletonLoader = () => {
    return (
      <div className="w-full">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    )
  }

  /**
   * Custom tooltip cho biểu đồ
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {payload[0]?.payload?.name}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  /**
   * Custom label cho trục Y
   */
  const formatYAxisLabel = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  // Hiển thị loading state
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
        {renderChartSkeletonLoader()}
      </div>
    )
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-[#878787] dark:text-gray-400 text-lg font-medium">{error}</p>
        </div>
      </div>
    )
  }

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartDataFormatted = prepareChartData()

  // Hiển thị biểu đồ
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8">
      {/* Tiêu đề và Dropdown */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-[22px] leading-[32px] font-semibold text-gray-800 dark:text-gray-200">
          Saving Summary
        </h2>
        <div className="flex items-center gap-3">
          <label
            htmlFor="year-select"
            className="text-sm text-gray-600 dark:text-gray-400 font-medium"
          >
            Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartDataFormatted}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              className="dark:stroke-gray-400"
              tick={{ fill: '#6B7280' }}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6B7280"
              className="dark:stroke-gray-400"
              tick={{ fill: '#6B7280' }}
              tickFormatter={formatYAxisLabel}
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            {/* Đường năm hiện tại - đậm, màu xanh */}
            <Line
              type="monotone"
              dataKey="thisYear"
              name="This Year"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            {/* Đường năm trước - mờ, màu xám */}
            <Line
              type="monotone"
              dataKey="lastYear"
              name="Same period last year"
              stroke="#9CA3AF"
              strokeWidth={2}
              strokeOpacity={0.6}
              dot={{ fill: '#9CA3AF', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SavingsSummaryChart

