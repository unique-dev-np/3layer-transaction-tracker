import React, { useState, useEffect } from 'react';

const FeatherIconWrapper = ({ name, ...props }) => {
  const [IconComponent, setIconComponent] = useState(null);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const feather = await import('feather-icons-react');
        if (feather[name]) {
          setIconComponent(() => feather[name]);
        } else {
          console.warn(`Icon '${name}' not found in feather-icons-react.`);
          setIconComponent(() => () => null); // Render nothing if icon not found
        }
      } catch (error) {
        console.error('Error loading feather icon:', error);
        setIconComponent(() => () => null); // Render nothing on error
      }
    };

    loadIcon();
  }, [name]);

  if (!IconComponent) {
    return null; // Or a loading spinner
  }

  return <IconComponent {...props} />;
};

export default FeatherIconWrapper;