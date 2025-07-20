import React from 'react';
import RequestItem from './RequestItem';

const HistoryList = ({ history, onRequestSelect }) => {
  return (
    <div>
      {history.length > 0 ? (
        history.map(item => (
          <RequestItem key={item.id} request={item} onRequestSelect={onRequestSelect} />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No history found</p>
          <p className="text-xs text-gray-400 mt-1">
            Send your first request to see it here
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryList;
