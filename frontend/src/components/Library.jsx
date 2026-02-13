export const Navbar = ({ title }) => (
  <nav className="p-4 bg-blue-600 text-white shadow-md">
    <h1 className="text-xl font-bold">{title}</h1>
  </nav>
);

export const Sidebar = ({ title, items = [] }) => (
  <aside className="w-64 bg-gray-50 border-r h-full flex flex-col overflow-hidden">
    {title && (
      <div className="p-4 border-b bg-white">
        <h2 className="font-bold text-gray-800 uppercase text-xs tracking-wider">{title}</h2>
      </div>
    )}
    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
      {items.map((item, index) => (
        <a
          key={index}
          href="#"
          className="block px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          {item}
        </a>
      ))}
    </nav>
  </aside>
);

export const Card = ({ title, description, children }) => (
  <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
    {(title || description) && (
      <div className="p-4 border-b bg-gray-50">
        {title && <h3 className="font-bold text-lg text-gray-900">{title}</h3>}
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
);

export const Container = ({ children }) => (
  <div className="max-w-7xl mx-auto p-6 space-y-4">
    {children}
  </div>
);

export const Row = ({ children }) => (
  <div className="flex flex-wrap -mx-2">
    {children}
  </div>
);

export const Column = ({ children }) => (
  <div className="flex-1 px-2">
    {children}
  </div>
);

export const Table = ({ headers, dataRows }) => (
  <div className="overflow-x-auto border rounded-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h, i) => <th key={i} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {dataRows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Button = ({ label, variant = 'primary', size = 'medium' }) => {
  const styles = {
    primary: 'bg-blue-600 text-white',
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white", 
    success: "bg-green-600 hover:bg-green-700 text-white"
  };
  return (
    <button className={`px-4 py-2 rounded font-medium ${styles[variant]} ${size === 'large' ? 'text-lg' : 'text-sm'}`}>
      {label}
    </button>
  );
};

export const Input = ({ label, placeholder, type = "text" }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);