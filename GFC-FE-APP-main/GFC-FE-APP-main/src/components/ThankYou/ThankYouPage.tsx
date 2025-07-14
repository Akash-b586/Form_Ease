import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Paper, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';
import { ROUTE_PATHS } from '../../utils/constants';
import './ThankYou.scss';

const ThankYouPage: React.FC = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const handleViewResponse = () => {
    navigate(`/my-response/${documentId}`);
  };

  const handleGoHome = () => {
    navigate(ROUTE_PATHS.HOME);
  };

  return (
    <div className="thank-you-container">
      <Paper elevation={3} className="thank-you-card">
        <Box className="thank-you-content">
          <CheckCircleIcon className="success-icon" />
          
          <Typography variant="h4" className="thank-you-title">
            Thank You!
          </Typography>
          
          <Typography variant="h6" className="thank-you-subtitle">
            Your response has been recorded successfully
          </Typography>
          
          <Typography variant="body1" className="thank-you-message">
            We appreciate you taking the time to fill out this form. 
            Your submission has been saved and you can view your responses anytime.
          </Typography>

          <Box className="action-buttons">
            <Button
              variant="contained"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={handleViewResponse}
              className="view-response-btn"
            >
              View My Response
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              className="go-home-btn"
            >
              Go to My Account
            </Button>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default ThankYouPage;
