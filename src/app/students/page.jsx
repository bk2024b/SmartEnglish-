import React from 'react';
import Students from '../components/Students';
import Layout from '../components/Layout'; // ton layout général avec sidebar

export default function StudentsPage() {
  return (
    <Layout>
      <Students />
    </Layout>
  );
}
