import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  CheckCircle2,
  Trophy,
  Radio,
  ArrowUpDown,
  Clock,
  RotateCcw,
} from "lucide-react";
import { API_URL } from "../config";

const ROUND_KEYS = ["Round1", "Round2", "Round3", "Round4"];

const formatTime = (seconds) => {
  if (seconds === null || seconds === undefined) return "\u2014";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const roundsCompleted = (student) =>
  ROUND_KEYS.filter(
    (r) => student.rounds?.[r]?.score !== null && student.rounds?.[r]?.score !== undefined
  ).length;

const overallAverage = (student) => {
  const scored = ROUND_KEYS.map((r) => student.rounds?.[r]?.score).filter(
    (s) => s !== null && s !== undefined
  );
  if (!scored.length) return null;
  return Math.round(scored.reduce((a, b) => a + b, 0) / scored.length);
};

const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token");

/* ------------------------------------------------------------------ */

const RoundPill = ({ round, data }) => {
  const attempted = data?.score !== null && data?.score !== undefined;
  if (!attempted) {
    return <div title={`${round}: not attempted`} className="h-2 w-7 rounded-full bg-violet-100" />;
  }
  const pass = data.result?.toLowerCase().includes("pass");
  return (
    <div
      title={`${round}: ${data.score} (${data.result})`}
      className={`h-2 w-7 rounded-full ${pass ? "bg-emerald-400" : "bg-rose-400"}`}
    />
  );
};

const StatCard = ({ icon: Icon, label, value, sub, gradient }) => (
  <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-white p-5 shadow-[0_2px_10px_rgba(109,40,217,0.06)]">
    <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 ${gradient}`} />
    <div className="relative flex items-center gap-3.5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white ${gradient}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold tracking-tight text-slate-800 leading-none">{value}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect to login if there's no admin token (SSO "token" or direct login "adminToken")
  useEffect(() => {
    if (!getToken()) navigate("/admin-login");
  }, [navigate]);

  // Load department + year filter options once
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const token = getToken();
        const [deptRes, yearRes] = await Promise.all([
          axios.get(`${API_URL}/admin/departments`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/admin/years`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setDepartments(deptRes.data.departments || []);
        setYears(yearRes.data.years || []);
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    };
    fetchFilters();
  }, []);

  // Reload students whenever a filter changes
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/admin/students`, {
          params: { department: selectedDepartment, year: selectedYear },
          headers: { Authorization: `Bearer ${token}` },
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

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = students.filter((s) => {
      if (!q) return true;
      return s.name?.toLowerCase().includes(q) || s.registerNumber?.toLowerCase().includes(q);
    });

    list = [...list].sort((a, b) => {
      let av, bv;
      if (sortKey === "progress") { av = roundsCompleted(a); bv = roundsCompleted(b); }
      else if (sortKey === "average") { av = overallAverage(a) ?? -1; bv = overallAverage(b) ?? -1; }
      else { av = a.name || ""; bv = b.name || ""; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [students, searchQuery, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const totalStudents = students.length;
  const completedAll = students.filter((s) => roundsCompleted(s) === ROUND_KEYS.length).length;
  const onlineNow = students.filter((s) => s.loggedIn).length;
  const averages = students.map(overallAverage).filter((v) => v !== null);
  const avgScoreAll = averages.length ? Math.round(averages.reduce((a, b) => a + b, 0) / averages.length) : 0;

  return (
    <div className="min-h-screen bg-[#FAF9FE]" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-7 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-200">
              Placement &amp; Assessment Cell
            </p>
            <h1
              className="text-2xl md:text-[28px] font-extrabold text-white tracking-tight mt-1"
              style={{ fontFamily: "'Manrope', ui-sans-serif" }}
            >
              Student Progress Dashboard
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-violet-100 backdrop-blur">
            <Radio className="h-3.5 w-3.5 text-emerald-300" />
            Live data
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-10 -mt-6 pb-10">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard icon={Users} label="Total Students" value={totalStudents} gradient="bg-gradient-to-br from-violet-500 to-indigo-500" />
          <StatCard icon={CheckCircle2} label="Completed All Rounds" value={completedAll} sub={totalStudents ? `of ${totalStudents}` : undefined} gradient="bg-gradient-to-br from-emerald-400 to-teal-500" />
          <StatCard icon={Trophy} label="Average Score" value={`${avgScoreAll}%`} gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
          <StatCard icon={Radio} label="Currently Online" value={onlineNow} gradient="bg-gradient-to-br from-fuchsia-500 to-pink-500" />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border border-violet-100 rounded-xl px-3.5 py-2 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-violet-100 rounded-xl px-3.5 py-2 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            <option value="All">All Years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <div className="relative ml-auto w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or register no."
              className="w-full border border-violet-100 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-[0_2px_14px_rgba(109,40,217,0.06)] overflow-hidden">
          {loading ? (
            <div className="p-14 text-center text-slate-400 text-sm">Loading students…</div>
          ) : error ? (
            <div className="p-14 text-center text-rose-500 text-sm">{error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-14 text-center text-slate-400 text-sm">
              {searchQuery ? "No students match your search." : "No students found for this filter."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-violet-50/70 text-violet-500 text-xs uppercase tracking-wide border-b border-violet-100">
                  <tr>
                    <th className="w-8"></th>
                    <th className="px-4 py-3 font-bold">
                      <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-violet-700">
                        Student <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-bold whitespace-nowrap">Dept / Year</th>
                    <th className="px-4 py-3 font-bold">
                      <button onClick={() => toggleSort("progress")} className="flex items-center gap-1 hover:text-violet-700">
                        Round Progress <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-bold text-center">
                      <button onClick={() => toggleSort("average")} className="flex items-center gap-1 mx-auto hover:text-violet-700">
                        Avg. Score <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-4 py-3 font-bold text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, i) => (
                    <FragmentRow
                      key={student.registerNumber}
                      student={student}
                      i={i}
                      isOpen={expanded === student.registerNumber}
                      avg={overallAverage(student)}
                      done={roundsCompleted(student)}
                      onToggle={() =>
                        setExpanded(expanded === student.registerNumber ? null : student.registerNumber)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Showing {filteredStudents.length} of {totalStudents} students &middot; click a row for round-by-round detail
        </p>
      </div>
    </div>
  );
}

function FragmentRow({ student, i, isOpen, avg, done, onToggle }) {
  const initials = (student.name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-violet-50 transition-colors hover:bg-violet-50/50 ${
          i % 2 === 0 ? "bg-white" : "bg-violet-50/20"
        }`}
      >
        <td className="pl-4">
          {isOpen ? <ChevronDown className="h-4 w-4 text-violet-400" /> : <ChevronRight className="h-4 w-4 text-violet-300" />}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-[11px] font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 leading-tight">{student.name}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{student.registerNumber}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-slate-600">
          <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-600">
            {student.department}
          </span>
          <span className="ml-2 text-xs text-slate-400">Year {student.year}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            {ROUND_KEYS.map((r) => <RoundPill key={r} round={r} data={student.rounds?.[r]} />)}
            <span className="ml-2 text-xs text-slate-400">{done}/4</span>
          </div>
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap">
          {avg === null ? (
            <span className="text-slate-300">—</span>
          ) : (
            <span className={`font-bold ${avg >= 40 ? "text-emerald-600" : "text-rose-500"}`}>{avg}%</span>
          )}
        </td>
        <td className="px-4 py-3 text-center whitespace-nowrap">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              student.loggedIn ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${student.loggedIn ? "bg-emerald-500" : "bg-slate-400"}`} />
            {student.loggedIn ? "Online" : "Offline"}
          </span>
        </td>
      </tr>

      {isOpen && (
        <tr className="bg-violet-50/40 border-b border-violet-50">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ROUND_KEYS.map((r) => {
                const d = student.rounds?.[r];
                const attempted = d?.score !== null && d?.score !== undefined;
                const pass = d?.result?.toLowerCase().includes("pass");
                return (
                  <div key={r} className="rounded-xl border border-violet-100 bg-white px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-violet-400 mb-2">{r}</p>
                    {!attempted ? (
                      <p className="text-sm text-slate-300">Not attempted</p>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Score</span>
                          <span className={`text-sm font-bold ${pass ? "text-emerald-600" : "text-rose-500"}`}>
                            {d.score} · {d.result}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Time</span>
                          <span className="text-xs text-slate-600">{formatTime(d.timeTakenSeconds)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Attempts left</span>
                          <span className="text-xs text-slate-600">{d.attemptsLeft}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}