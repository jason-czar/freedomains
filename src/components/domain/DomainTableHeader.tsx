
import React from "react";

const DomainTableHeader: React.FC = () => {
  return (
    <thead>
      <tr className="border-b border-gray-200">
        <th className="py-3 text-left font-semibold text-gray-600">Domain</th>
        <th className="py-3 text-left font-semibold text-gray-600">Type</th>
        <th className="py-3 text-left font-semibold text-gray-600">Status</th>
        <th className="py-3 text-left font-semibold text-gray-600">Registered On</th>
        <th className="py-3 text-left font-semibold text-gray-600">Expires On</th>
        <th className="py-3 text-left font-semibold text-gray-600">Actions</th>
      </tr>
    </thead>
  );
};

export default DomainTableHeader;
