import React from 'react';
import Layout from '../../components/Layout';
import StudentProgress from '../../components/StudentProgress';

export default function StudentProgressPage({ params }) {
  return (
    <Layout>
      <StudentProgress params={params} />
    </Layout>
  );
}