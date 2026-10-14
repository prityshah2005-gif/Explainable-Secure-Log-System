
function StatCard({ title, value, note, icon: Icon, color }) {
  return (
    <section className="stat-card">
      <div className="stat-top">
        <span>{title}</span>

        <div className={`stat-icon ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <h2>{value}</h2>
      <p>{note}</p>
    </section>
  );
}

export default StatCard;