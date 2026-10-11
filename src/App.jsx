import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [showReport, setShowReport] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [showHotspots, setShowHotspots] = useState(false);
  useEffect(() => {
  fetchDashboardData();

  const interval = setInterval(() => {
    fetchDashboardData();
  }, 30000);

  return () => clearInterval(interval);
}, []);

  // =========================
  // PHOTO CHANGE
  // =========================

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setPhoto(file);
    }
  };

  // =========================
  // SUBMIT REPORT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!photo || !location.trim()) {
      alert("Please upload a waste photo and enter the location.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("photo", photo);
      formData.append("location", location);
      formData.append("description", description);

      const response = await fetch(
        "https://42qwrj5euf.execute-api.ap-south-1.amazonaws.com/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("EcoTrack API response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Analysis failed"
        );
      }

      setAnalysis(data);
      setSubmitted(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("EcoTrack API error:", error);

      alert(
        error.message ||
          "Unable to analyze the report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
  try {
    const response = await fetch(
      "https://54r8p2aup5.execute-api.ap-south-1.amazonaws.com/default/ecotrack-dashboard"
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to load dashboard data");
    }

    setDashboardData(data);
    console.log("Dashboard data:", data);
    console.log("Hotspots:", data.stats?.hotspots);
  } catch (error) {
    console.error("Dashboard API error:", error);
  }
};


const handleResolveReport = async (reportId) => {
  if (!reportId) {
    alert("Report ID is missing.");
    return;
  }

  try {
    const response = await fetch(
      "https://42qwrj5euf.execute-api.ap-south-1.amazonaws.com/resolve",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportId }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to resolve report.");
    }

    alert("Report marked as resolved!");
    await fetchDashboardData();
  } catch (error) {
    console.error("Resolve report error:", error);
    alert(error.message || "Unable to resolve report.");
  }
};


  // =========================
  // OPEN REPORT PAGE
  // =========================

  const openReportPage = () => {
    setPhoto(null);
    setLocation("");
    setDescription("");
    setAnalysis(null);
    setSubmitted(false);
    setShowReport(true);
    

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // GO HOME
  // =========================

  const goHome = () => {
    setShowReport(false);
    setSubmitted(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // REPORT PAGE
  // =========================

  if (showReport) {
    return (
      <div className="app">

        {/* ================= NAVBAR ================= */}

        <nav className="navbar">

          <button
            className="logo"
            onClick={goHome}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <span className="logo-icon">♻</span>

            <span>
              EcoTrack <strong>AI</strong>
            </span>
          </button>

          <button
            className="secondary-button"
            onClick={goHome}
          >
            ← Back to Home
          </button>

        </nav>

        {/* ================= REPORT PAGE ================= */}

        <main className="report-page">

          <div className="report-header">

            <span className="section-label">
              REPORT AN ENVIRONMENTAL ISSUE
            </span>

            <h1>
              Help us make your
              <span> community cleaner.</span>
            </h1>

            <p>
              Upload a photo and tell us where the waste problem
              is. EcoTrack AI will analyze the report and help
              prioritize the issue.
            </p>

          </div>

          {!submitted ? (
            <form
              className="report-card"
              onSubmit={handleSubmit}
            >

              {/* ================= PHOTO ================= */}

              <div className="form-group">

                <label>
                  Waste Photo
                  <span className="required">*</span>
                </label>

                <label className="upload-box">

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    hidden
                  />

                  <div className="upload-icon">
                    📸
                  </div>

                  {photo ? (
                    <div className="selected-file">

                      <strong>
                        {photo.name}
                      </strong>

                      <span>
                        Photo selected successfully
                      </span>

                    </div>
                  ) : (
                    <div>

                      <strong>
                        Upload a photo
                      </strong>

                      <span>
                        JPG, PNG or WEBP
                      </span>

                    </div>
                  )}

                </label>

              </div>

              {/* ================= LOCATION ================= */}

              <div className="form-group">

                <label htmlFor="location">
                  Location
                  <span className="required">*</span>
                </label>

                <div className="input-with-icon">

                  <span>
                    📍
                  </span>

                  <input
                    id="location"
                    type="text"
                    placeholder="e.g. College Road, Nagpur"
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                  />

                </div>

              </div>

              {/* ================= DESCRIPTION ================= */}

              <div className="form-group">

                <label htmlFor="description">

                  Describe the problem

                  <span className="optional">
                    Optional
                  </span>

                </label>

                <textarea
                  id="description"
                  rows="5"
                  placeholder="Tell us what you see... For example: Large amount of mixed waste overflowing near the road."
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />

              </div>

              {/* ================= SUBMIT ================= */}

              <button
                type="submit"
                className="primary-button report-submit"
                disabled={loading}
              >

                {loading
                  ? "🤖 Analyzing..."
                  : "🤖 Analyze & Report"}

              </button>

              <p className="form-note">
                Your report will be analyzed by EcoTrack AI
                before being prioritized.
              </p>

            </form>
          ) : (

            /* ================= SUCCESS ================= */

            <div className="success-card">

              <div className="success-icon">
                ✓
              </div>

              <span className="section-label">
                REPORT RECEIVED
              </span>

              <h2>
                Your report has been received.
              </h2>

              <p>
                We received your waste report from:
              </p>

              <strong className="success-location">
                📍 {location}
              </strong>

              {photo && (
                <p className="success-photo">
                  📸 {photo.name}
                </p>
              )}


{/* ================= REPORT ANALYSIS ================= */}

{analysis && (
  <div className="demo-analysis">

    {/* STATUS BOX */}
    <div>
      <span>Status</span>

      <strong>
        {analysis.wasteType
          ? "Preliminary Assessment Complete"
          : "Report Received"}
      </strong>
    </div>

    {/* PRIORITY BOX */}
    <div>
      <span>Priority Assessment</span>

      <strong>
        {analysis.priority ||
          analysis.severity ||
          "Not assessed"}
      </strong>
    </div>

    {/* WASTE TYPE BOX */}
    <div>
      <span>Waste Type</span>

      <strong>
        {analysis.wasteType || "Not classified"}
      </strong>
    </div>

  </div>
)}

{/* ================= BACK BUTTON ================= */}

<button
  className="primary-button"
  onClick={goHome}
>
  ← Back to EcoTrack AI
</button>

</div>
)}

        </main>

        {/* ================= FOOTER ================= */}

        <footer className="footer">

          <div className="logo">

            <span className="logo-icon">
              ♻
            </span>

            <span>
              EcoTrack <strong>AI</strong>
            </span>

          </div>

          <p>
            Environmental action powered by technology.
          </p>

        </footer>

      </div>
    );
  }

  // =========================
  // HOME PAGE
  // =========================

  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <button
          className="logo"
          onClick={goHome}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
          }}
        >

          <span className="logo-icon">
            ♻
          </span>

          <span>
            EcoTrack <strong>AI</strong>
          </span>

        </button>

        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#impact">
            Impact
          </a>

          <button
            className="nav-button"
            onClick={openReportPage}
          >
            Report Waste
          </button>

        </div>

      </nav>

      {/* ================= HERO ================= */}

      <section
        className="hero-section"
        id="home"
      >

        <div className="hero-content">

          <div className="hero-badge">
            🌱 AI-powered environmental action
          </div>

          <h1>
            Turn Waste Reports
            <br />
            Into <span>Real Action.</span>
          </h1>

          <p className="hero-description">
            EcoTrack AI helps communities report waste problems,
            automatically analyze their severity, and track them
            from report to resolution.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={openReportPage}
            >
              ♻ Report Waste
            </button>

            <a
              href="#how-it-works"
              className="secondary-button"
            >
              See How It Works →
            </a>

          </div>

          {/* ================= STATS ================= */}

          <div className="hero-stats">

            <div className="stat">

              <strong>
                AI
              </strong>

              <span>
                Waste Analysis
              </span>

            </div>

            <div className="stat">

              <strong>
                24/7
              </strong>

              <span>
                Community Reporting
              </span>

            </div>

            <div className="stat">

              <strong>
                100%
              </strong>

              <span>
                Trackable
              </span>

            </div>

          </div>

        </div>

        {/* ================= HERO VISUAL ================= */}

        <div className="hero-visual">

          <div className="visual-card">

            <div className="visual-header">

              <span>
                ♻ EcoTrack AI
              </span>

              <span className="live-status">
                ● Live
              </span>

            </div>

            <div className="map-placeholder">

              <div className="map-grid"></div>

              <div className="map-pin pin-one">
                🔴
              </div>

              <div className="map-pin pin-two">
                🟠
              </div>

              <div className="map-pin pin-three">
                🟢
              </div>

              <div className="map-label label-one">
                High Priority
              </div>

              <div className="map-label label-two">
                Medium
              </div>

              <div className="map-label label-three">
                Resolved
              </div>

            </div>

            <div className="visual-footer">

              <div>

                <span className="mini-label">
                  Reports
                </span>

                <strong>
                  {dashboardData?.stats?.totalReports ?? 0}
                </strong>

              </div>

              <div>

                <span className="mini-label">
                  Resolved
                </span>

                <strong>
                  {dashboardData?.stats?.resolved ?? 0}
                </strong>

              </div>

              <div>

                <span className="mini-label">
                  High Priority
                </span>

                <strong>
                  {dashboardData?.stats?.highPriority ?? 0}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>

      
{/* ================= WASTE HOTSPOT INTELLIGENCE ================= */}

<section className="problem-section" id="waste-hotspots">
  <div className="section-heading">
    <span className="section-label">LIVE ENVIRONMENTAL INSIGHTS</span>
    <h2>
      Waste Hotspot <span>Intelligence.</span>
    </h2>
    <p>
      Discover locations with the highest number of reported waste
      problems and help prioritize cleanup efforts.
    </p>
  </div>

  <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
    <button
      type="button"
      className="feature-card"
      onClick={() => setShowHotspots(!showHotspots)}
      style={{
        display: "block",
        width: "min(100%, 380px)",
        margin: "0 auto",
        textAlign: "left",
        cursor: "pointer",
        color: "inherit",
        font: "inherit",
      }}
    >
      <div className="feature-icon">📊</div>
      <h3>
        {showHotspots ? "Hide Hotspots ▲" : "View Waste Hotspots ▼"}
      </h3>
      <p>
        {dashboardData?.stats?.hotspots?.length
          ? `${dashboardData.stats.hotspots.length} locations analyzed. Click to view hotspot details.`
          : "Click to check available hotspot insights."}
      </p>
    </button>

    {showHotspots && (
      <div
        className="feature-grid"
        style={{ marginTop: "24px" }}
      >
        {(dashboardData?.stats?.hotspots || []).length > 0 ? (
          dashboardData.stats.hotspots.map((hotspot) => (
            <div className="feature-card" key={hotspot.location}>
              <div className="feature-icon">📍</div>
              <h3>{hotspot.location}</h3>
              <p>
                {hotspot.reportCount} reported waste issue
                {hotspot.reportCount !== 1 ? "s" : ""}
              </p>
              <strong>{hotspot.priority} Hotspot Priority</strong>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center" }}>
            Hotspot data is currently unavailable. Please try again shortly.
          </p>
        )}
      </div>
    )}
  </div>
</section>


{/* ================= REPORT RESOLUTION ================= */}

<section className="problem-section" id="report-resolution">
  <div className="section-heading">
    <span className="section-label">REPORT MANAGEMENT</span>
    <h2>
      Manage <span>Reports.</span>
    </h2>
    <p>
      Review submitted reports and mark completed cleanup work as resolved.
    </p>
  </div>

  <div className="feature-grid">
    {(dashboardData?.reports || []).map((report) => (
      <div className="feature-card" key={report.reportId}>
        <h3>{report.location || "Unknown location"}</h3>
        <p>{report.wasteType || report.classification || "Waste report"}</p>
        <p>Status: {report.status || "REPORTED"}</p>
        <p>Priority: {report.priority || "Not specified"}</p>

        {report.status !== "RESOLVED" ? (
          <button
            type="button"
            onClick={() => handleResolveReport(report.reportId)}
          >
            Mark as Resolved
          </button>
        ) : (
          <p>✅ Resolved</p>
        )}
      </div>
    ))}
  </div>
</section>


{/* ================= WASTE TYPE ANALYTICS ================= */}

<section className="problem-section" id="waste-analytics">
  <div className="section-heading">
    <span className="section-label">LIVE WASTE DATA</span>
    <h2>
      Understand the <span>Waste.</span>
    </h2>
    <p>
      Explore the distribution of reported waste categories using live
      data from EcoTrack AI.
    </p>
  </div>

  <div className="feature-grid">
    {Object.entries(dashboardData?.stats?.byWasteType || {}).map(
      ([type, count]) => (
        <div className="feature-card" key={type}>
          <div className="feature-icon">♻️</div>
          <h3>{type}</h3>
          <p>{count} report{count !== 1 ? "s" : ""}</p>
        </div>
      )
    )}
  </div>
</section>







      {/* ================= PROBLEM ================= */}

      <section
        className="problem-section"
        id="impact"
      >

        <div className="section-heading">

          <span className="section-label">
            THE PROBLEM
          </span>

          <h2>
            Waste problems shouldn't
            <span> disappear unnoticed.</span>
          </h2>

          <p>
            Overflowing garbage is often reported too late,
            difficult to prioritize, and even harder to track
            until it is actually resolved.
          </p>

        </div>

        <div className="feature-grid">

        

          <div className="feature-card">

            <div className="feature-icon">
              📸
            </div>

            <h3>
              Report
            </h3>

            <p>
              Citizens can upload a photo and location
              of a waste problem in seconds.
            </p>

          </div>

          <div className="feature-card featured">

            <div className="feature-icon">
              🤖
            </div>

            <h3>
              Analyze
            </h3>

            <p>
              AI analyzes the report and determines
              the waste type, severity, and priority.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-icon">
              ✅
            </div>

            <h3>
              Resolve
            </h3>

            <p>
              Authorities can track every report from
              submission through final resolution.
            </p>

          </div>

        </div>

      </section>

      {/* ================= WORKFLOW ================= */}

      <section
        className="workflow-section"
        id="how-it-works"
      >

        <div className="section-heading">

          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            From <span>problem</span> to resolution.
          </h2>

        </div>

        <div className="workflow">

          <div className="workflow-step">

            <div className="step-number">
              01
            </div>

            <div>

              <h3>
                Report
              </h3>

              <p>
                Upload a photo and provide the
                location of the waste.
              </p>

            </div>

          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">

            <div className="step-number">
              02
            </div>

            <div>

              <h3>
                AI Analysis
              </h3>

              <p>
                AI identifies the waste type and
                determines its severity.
              </p>

            </div>

          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">

            <div className="step-number">
              03
            </div>

            <div>

              <h3>
                Prioritize
              </h3>

              <p>
                Reports are ranked so urgent
                problems receive attention first.
              </p>

            </div>

          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">

            <div className="step-number">
              04
            </div>

            <div>

              <h3>
                Resolve
              </h3>

              <p>
                Track the cleanup process until
                the issue is completely resolved.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ================= IMPACT ================= */}

      <section className="impact-section">

        <div className="impact-content">

          <span className="section-label">
            OUR MISSION
          </span>

          <h2>
            Make environmental action
            <span> visible.</span>
          </h2>

          <p>
            EcoTrack AI connects citizens and authorities
            through one transparent workflow — turning
            environmental complaints into measurable action.
          </p>

          <button
            className="primary-button"
            onClick={openReportPage}
          >
            Start Reporting →
          </button>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <div className="logo">

          <span className="logo-icon">
            ♻
          </span>

          <span>
            EcoTrack <strong>AI</strong>
          </span>

        </div>

        <p>
          Built for Environmental Hacks 2026
        </p>

        <p>
          AWS-powered environmental action.
        </p>

      </footer>

    </div>
  );
}

export default App;