/* error.jsx */
/* -------------------*/
import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppSettings } from './../../config/app-settings.js';

function Error() {
  const context = useContext(AppSettings);

  useEffect(() => {
    context.handleSetAppSidebarNone(true);
    context.handleSetAppHeaderNone(true);
    context.handleSetAppContentClass('p-0');

    return () => {
      context.handleSetAppSidebarNone(false);
      context.handleSetAppHeaderNone(false);
      context.handleSetAppContentClass('');
    };
		
		// eslint-disable-next-line
	}, []);

  return (
    <div className="error">
      <div className="error-code">404</div>
      <div className="error-content">
        <div className="error-message">¡Parece que te perdiste!</div>
        <div className="error-desc mb-4">
          La página que estas buscando no existe<br />
        </div>
        <div>
          <Link to="/" className="btn btn-primary px-3">Regresar</Link>
        </div>
      </div>
    </div>
  );
}

export default Error;