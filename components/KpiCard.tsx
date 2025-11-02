import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value }) => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-color)' }}>{label}</div>
    </div>
  );
};

export default KpiCard;