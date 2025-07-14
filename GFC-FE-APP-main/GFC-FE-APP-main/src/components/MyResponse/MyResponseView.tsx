import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Paper, Box, Button, Divider, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { ROUTE_PATHS, REQUEST_URLS, HTTP_METHODS } from '../../utils/constants';
import { useAuth } from '../contexts/auth-context';
import useAxios from '../../utils/axios';
import './MyResponse.scss';

interface MyResponseData {
  documentName: string;
  documentDescription: string;
  questions: any[];
  answers: any;
  submittedOn: string;
  username: string;
}

const MyResponseView: React.FC = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { HttpRequestController, handlePromiseRequest, isRequestPending } = useAxios();
  const [responseData, setResponseData] = useState<MyResponseData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMyResponse = async () => {
    try {
      const response = await HttpRequestController(
        `${REQUEST_URLS.MY_RESPONSE}/${documentId}/${user.userId}`,
        HTTP_METHODS.GET
      );
      setResponseData(response);
    } catch (error) {
      console.error('Error loading response:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId && user.userId) {
      loadMyResponse();
    }
  }, [documentId, user.userId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(ROUTE_PATHS.HOME);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAnswer = (question: any, answer: any) => {
    if (!answer) return <span className="no-answer">No answer provided</span>;

    switch (question.questionType) {
      case 'checkbox':
        return Array.isArray(answer) ? answer.join(', ') : answer;
      case 'radio':
      case 'short-answer':
      case 'paragraph':
      case 'date':
      case 'time':
        return answer;
      default:
        return answer;
    }
  };

  if (loading) {
    return (
      <div className="my-response-loading">
        <CircularProgress />
        <Typography variant="h6" style={{ marginTop: '16px' }}>
          Loading your response...
        </Typography>
      </div>
    );
  }

  if (!responseData) {
    return (
      <div className="my-response-error">
        <Typography variant="h5">Response Not Found</Typography>
        <Typography variant="body1">
          We couldn't find your response for this form.
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleGoHome}
          style={{ marginTop: '16px' }}
        >
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="my-response-container">
      <div className="my-response-header">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          className="back-button"
        >
          Back
        </Button>
        
        <Button
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          variant="outlined"
          className="home-button"
        >
          My Account
        </Button>
      </div>

      <Paper elevation={3} className="my-response-card">
        <Box className="my-response-content">
          {/* Form Header */}
          <div className="form-header-section">
            <Typography variant="h4" className="form-title">
              {responseData.documentName}
            </Typography>
            <Typography variant="h6" className="form-description">
              {responseData.documentDescription}
            </Typography>
          </div>

          <Divider className="section-divider" />

          {/* Response Info */}
          <div className="response-info">
            <div className="info-item">
              <PersonIcon className="info-icon" />
              <Typography variant="body1">
                <strong>Submitted by:</strong> {responseData.username}
              </Typography>
            </div>
            <div className="info-item">
              <DateRangeIcon className="info-icon" />
              <Typography variant="body1">
                <strong>Submitted on:</strong> {formatDate(responseData.submittedOn)}
              </Typography>
            </div>
          </div>

          <Divider className="section-divider" />

          {/* Questions and Answers */}
          <div className="questions-section">
            <Typography variant="h5" className="section-title">
              Your Responses
            </Typography>
            
            {responseData.questions.map((question: any, index: number) => (
              <div key={question._id || index} className="question-block">
                <Typography variant="h6" className="question-text">
                  {index + 1}. {question.question}
                  {question.required && <span className="required-indicator"> *</span>}
                </Typography>
                
                <div className="answer-block">
                  <Typography variant="body1" className="answer-text">
                    {renderAnswer(question, responseData.answers[question._id])}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Box>
      </Paper>
    </div>
  );
};

export default MyResponseView;
