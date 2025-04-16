
import React from "react";

const DNSEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <p className="text-gray-500">No DNS records found for this domain.</p>
      <p className="text-gray-500 mt-1">Add your first DNS record using the Add Record tab.</p>
    </div>
  );
};

export default DNSEmptyState;
