import { useEffect, useState } from "react";
import axios from "axios";

const ROUND_KEYS = ["Round1", "Round2", "Round3", "Round4"];

// e.g. 142 -> "2m 22s"
const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return "--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const AdminDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the department + year lists once, for the filter dropdowns
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [deptRes, yearRes] = await Promise.all([
          axios.get("http://localhost:3007/admin/departments"),
          axios.get("http://localhost:3007/admin/years"),
        ]);
        setDepartments(deptRes.data.departments || []);
        setYears(yearRes.data.years || []);
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    };
    fetchFilters();
  }, []);

  // Reload the student table whenever either filter changes
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:3007/admin/students", {
          params: { department: selectedDepartment, year: selectedYear },
        });
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("Failed to fetch students", err);
        setError("Couldn't load student data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedDepartment, selectedYear]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6">
        Admin Dashboard
      </h1>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <option value="All">All Years</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Loading students...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500 text-sm">{error}</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No students found for this filter.
          </div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-sky-50 text-sky-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Register No.</th>
                <th className="px-4 py-3 whitespace-nowrap">Department</th>
                <th className="px-4 py-3 whitespace-nowrap">Year</th>
                {ROUND_KEYS.map((round) => (
                  <th key={round} className="px-4 py-3 whitespace-nowrap text-center">
                    {round} Score
                  </th>
                ))}
                {ROUND_KEYS.map((round) => (
                  <th key={`${round}-attempts`} className="px-4 py-3 whitespace-nowrap text-center">
                    {round} Attempts Left
                  </th>
                ))}
                {ROUND_KEYS.map((round) => (
                  <th key={`${round}-time`} className="px-4 py-3 whitespace-nowrap text-center">
                    {round} Time Taken
                  </th>
                ))}
                <th className="px-4 py-3 whitespace-nowrap text-center">Logged In</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <tr
                  key={student.registerNumber}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                >
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {student.registerNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {student.department}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {student.year}
                  </td>

                  {ROUND_KEYS.map((round) => {
                    const score = student.rounds[round]?.score;
                    const result = student.rounds[round]?.result;
                    const isPass = result?.toLowerCase().includes("pass");
                    return (
                      <td key={round} className="px-4 py-3 text-center whitespace-nowrap">
                        {score === null || score === undefined ? (
                          <span className="text-gray-300">--</span>
                        ) : (
                          <span
                            className={`font-semibold ${
                              isPass ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {score}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {ROUND_KEYS.map((round) => (
                    <td
                      key={`${round}-attempts`}
                      className="px-4 py-3 text-center whitespace-nowrap text-gray-600"
                    >
                      {student.rounds[round]?.attemptsLeft}
                    </td>
                  ))}

                  {ROUND_KEYS.map((round) => (
                    <td
                      key={`${round}-time`}
                      className="px-4 py-3 text-center whitespace-nowrap text-gray-600"
                    >
                      {formatTime(student.rounds[round]?.timeTakenSeconds)}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.loggedIn
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {student.loggedIn ? "true" : "false"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;