
import React from "react";

interface DomainTableHeaderProps {
  showEmailStatus?: boolean;
}

const DomainTableHeader: React.FC<DomainTableHeaderProps> = ({ showEmailStatus = false }) => {
  return (
    <thead>
      <tr className="border-b border-gray-100">
        <th className="py-3 text-left font-semibold">Domain</th>
        <th className="py-3 text-left font-semibold">Type</th>
        <th className="py-3 text-left font-semibold">Status</th>
        <th className="py-3 text-left font-semibold">Registration Date</th>
        <th className="py-3 text-left font-semibold">Expiration</th>
        {showEmailStatus && (
          <th className="py-3 text-left font-semibold">Email</th>
        )}
        <th className="py-3 text-left font-semibold">Actions</th>
      </tr>
    </thead>
  );
};

export default DomainTableHeader;
