import './App.scss';
import { Header } from './components/Header/Header';
import Mainbody from './components/Mainbody/Mainbody';
import Templates from './components/Mainbody/Templates';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import Login from './components/Login';
import FormHeader from './components/ConfigureQuestionPaper/FormHEader';
import CenteredTabs from './components/common/Tabs';
import ThankYouPage from './components/ThankYou/ThankYouPage';
import MyResponseView from './components/MyResponse/MyResponseView';
import { ROUTE_PATHS } from './utils/constants';
import { ThemeProvider } from './components/contexts/themeContext';
import { Toaster } from 'react-hot-toast';
import { useAuth } from 'components/contexts/auth-context';
import { DocumentContextProvider } from 'components/contexts/questions-context';
import { DocumentsNameContextProvider } from 'components/contexts/documents-context';
import { GuideProvider } from 'components/contexts/guide-context';
import { useState } from 'react';

function App() {
  // true if user is logged in
  let { isLoggedIn } = useAuth();
  
  return (
    <div style={{ overflow: 'hidden' }}>
      <BrowserRouter>
        <DocumentsNameContextProvider>
          <GuideProvider>
            <Routes>
              {/* login and register page  */}
              <Route path={ROUTE_PATHS.LOGIN}
                element={<Login />} />

              {/* main page to display templates and documents  */}
              <Route
                path={ROUTE_PATHS.HOME}
                element={
                  <ProtectedRoute
                    element={
                      <>
                        <Header />
                        <Templates />
                        <Mainbody />
                      </>
                    }
                  />
                }
              />

              {/* displays the document questions */}
              <Route
                path={ROUTE_PATHS.QUESTION_PAPER}
                element={
                  <ProtectedRoute
                    element={
                      <DocumentContextProvider>
                        <ThemeProvider>
                          <FormHeader />
                          <CenteredTabs />
                        </ThemeProvider>
                      </DocumentContextProvider>
                    }
                  />
                }
              />

              {/* user view form for filling/submitting responses */}
              <Route
                path={ROUTE_PATHS.USERVIEW}
                element={
                  <ProtectedRoute
                    element={
                      <DocumentContextProvider>
                        <ThemeProvider>
                          <FormHeader />
                          <CenteredTabs />
                        </ThemeProvider>
                      </DocumentContextProvider>
                    }
                  />
                }
              />

              {/* thank you page after form submission */}
              <Route
                path={ROUTE_PATHS.THANK_YOU}
                element={
                  <ProtectedRoute
                    element={<ThankYouPage />}
                  />
                }
              />

              {/* my response page to view submitted response */}
              <Route
                path={ROUTE_PATHS.MY_RESPONSE}
                element={
                  <ProtectedRoute
                    element={<MyResponseView />}
                  />
                }
              />

              {/* navigates to home page if user visits invalid route */}
              <Route path={"*"} element={<Navigate to={ROUTE_PATHS.LOGIN} replace />}></Route>
            </Routes>
          </GuideProvider>
        </DocumentsNameContextProvider>
      </BrowserRouter >
      <Toaster />
    </div >
  );
}

const ProtectedRoute: React.FC<{ element: any }> = ({ element }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute Debug - location.pathname:", location.pathname);
  console.log("ProtectedRoute Debug - isLoggedIn:", isLoggedIn);
  
  if (!isLoggedIn) {
    const redirectUrl = `${ROUTE_PATHS.LOGIN}?redirect=${encodeURIComponent(location.pathname)}`;
    console.log("ProtectedRoute Debug - redirecting to:", redirectUrl);
    window.location.href = redirectUrl;
    return null;
  }
  
  return element;
}

export default App;
