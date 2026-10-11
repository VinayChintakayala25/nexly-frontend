
import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";
import "./StudentMatching.css";

function StudentMatching() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadMatches = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/student/matching");

            setMatches(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Unable to load opportunity matches:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load opportunity matches."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMatches();
    }, [loadMatches]);

    const getMatchClass = (percentage) => {
        if (percentage >= 80) return "excellent";
        if (percentage >= 60) return "good";
        if (percentage >= 40) return "medium";
        return "low";
    };

    const getSkillArray = (skills) => {
        return Array.isArray(skills)
            ? skills.filter(
                (skill) =>
                    typeof skill === "string" &&
                    skill.trim().length > 0
            )
            : [];
    };

    return (
        <div className="student-matching-page">
            <div className="matching-header">
                <div>
                    <span className="matching-eyebrow">
                        NEXLY INTELLIGENCE
                    </span>

                    <h1>Match &amp; Skill Gap</h1>

                    <p>
                        Discover how well your skills match available
                        opportunities and identify the skills you can improve.
                    </p>
                </div>

                <div className="matching-header-icon">✦</div>
            </div>

            {error && (
                <div className="matching-error">
                    <span>⚠</span>
                    <span>{error}</span>
                    <button onClick={loadMatches}>Try Again</button>
                </div>
            )}

            {loading ? (
                <div className="matching-loading">
                    <Loading />
                </div>
            ) : matches.length === 0 ? (
                <div className="matching-empty">
                    <div className="matching-empty-icon">✦</div>
                    <h2>No matches available yet</h2>
                    <p>
                        Add skills to your profile and check again when
                        opportunities are available. Nexly will calculate
                        your match automatically.
                    </p>
                </div>
            ) : (
                <div className="matching-list">
                    {matches.map((match, index) => {
                        const rawPercentage = Number(
                            match.matchPercentage
                        );

                        const percentage = Number.isFinite(rawPercentage)
                            ? Math.max(0, Math.min(100, rawPercentage))
                            : 0;

                        const matchClass = getMatchClass(percentage);
                        const matchingSkills = getSkillArray(
                            match.matchingSkills
                        );
                        const missingSkills = getSkillArray(
                            match.missingSkills
                        );

                        /*
                         * Empty matching and missing lists do not prove
                         * that the student has all required skills.
                         * They may indicate that skill data is unavailable.
                         */
                        const hasSkillData =
                            matchingSkills.length > 0 ||
                            missingSkills.length > 0;

                        return (
                            <article
                                key={
                                    match.opportunityId ??
                                    match.id ??
                                    index
                                }
                                className="matching-card"
                            >
                                <div className="matching-card-main">
                                    <div className="matching-opportunity-icon">
                                        N
                                    </div>

                                    <div className="matching-opportunity-info">
                                        <h2>
                                            {match.opportunityTitle ||
                                                "Opportunity"}
                                        </h2>

                                        <p>
                                            Opportunity #
                                            {match.opportunityId ?? "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="matching-score">
                                    <div
                                        className={`match-circle ${matchClass}`}
                                    >
                                        <strong>{percentage}%</strong>
                                        <span>Match</span>
                                    </div>
                                </div>

                                <div className="matching-progress">
                                    <div className="progress-header">
                                        <span>Skill compatibility</span>
                                        <strong>{percentage}%</strong>
                                    </div>

                                    <div
                                        className="progress-track"
                                        role="progressbar"
                                        aria-label="Skill compatibility"
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={percentage}
                                    >
                                        <div
                                            className={`progress-fill ${matchClass}`}
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="matching-skills-section">
                                    <div className="skills-column">
                                        <h3>✓ Matching Skills</h3>

                                        {matchingSkills.length > 0 ? (
                                            <div className="skill-list">
                                                {matchingSkills.map(
                                                    (skill, skillIndex) => (
                                                        <span
                                                            key={`${skill}-${skillIndex}`}
                                                            className="skill-chip matched"
                                                        >
                                                            ✓ {skill}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <p className="no-skills">
                                                No matching skills yet.
                                            </p>
                                        )}
                                    </div>

                                    <div className="skills-column">
                                        <h3>+ Skills to Improve</h3>

                                        {missingSkills.length > 0 ? (
                                            <div className="skill-list">
                                                {missingSkills.map(
                                                    (skill, skillIndex) => (
                                                        <span
                                                            key={`${skill}-${skillIndex}`}
                                                            className="skill-chip missing"
                                                        >
                                                            + {skill}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        ) : hasSkillData ? (
                                            <p className="no-skills">
                                                You have all required skills.
                                            </p>
                                        ) : (
                                            <p className="no-skills">
                                                Skill-gap data is unavailable.
                                                Check your profile skills and
                                                try again.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default StudentMatching;
