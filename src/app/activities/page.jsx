import React from 'react';
import Activities from '../components/Activities';
import Layout from '../components/Layout'; // ton layout général avec sidebar

export default function StudentsPage() {
  return (
    <Layout>
      <Activities />
    </Layout>
  );
}
