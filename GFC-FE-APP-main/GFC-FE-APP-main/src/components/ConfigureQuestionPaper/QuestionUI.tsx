import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateIcon from '@mui/icons-material/Create';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import { Accordion, Button, debounce, Tooltip } from "@mui/material";
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Question } from "../../utils/Question";
import useAxios from '../../utils/axios';
import { Answers, HTTP_METHODS, QUESTION_ACTION_TYPES, QUESTION_TYPES, REQUEST_FAILURE_MESSAGES, REQUEST_SUCCESS_MESSAGES, REQUEST_URLS, ROUTE_PATHS } from "../../utils/constants";
import { getCurrentDateTime } from '../../utils/util';
import { DisplayQuestion } from './Displayquestion';
import { OptionBox } from './OptionBox';
import { QuestionBoxFooter } from './QuestionBoxFooter';
import "./QuestionUI.scss";
import { SelectBox } from './SelectBox';
import { useDocument } from 'components/contexts/questions-context';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const SAVING = 'Saving...';
export function QuestionForm() {
  const [yoffset, setYOffset] = useState(0);
  const [answers, setAnswers] = useState<Answers>();
  let params = useParams();
  let navigate = useNavigate();
  let { HttpRequestController, isRequestPending, handlePromiseRequest } = useAxios();
  let { questions, dispatch, currentFocusedQuestionId, documentName,
    documentDescription, viewDocument, createdByUserID, user } = useDocument();

  useEffect(() => {
    if (viewDocument) {
      closeAllExpandedQuestion();
    }
  }, [viewDocument]);

  useEffect(() => {
    updateToolBoxPosition();
  }, [currentFocusedQuestionId, questions]);

  // Specifically handle when currentFocusedQuestionId changes
  useEffect(() => {
    if (currentFocusedQuestionId) {
      // Add a longer delay to ensure DOM elements are properly rendered and positioned
      setTimeout(() => {
        const element = document.getElementById(currentFocusedQuestionId);
        if (element) {
          updateToolBoxPosition();
        }
      }, 100);
    }
  }, [currentFocusedQuestionId]);

  // Initialize toolkit position on component mount
  useEffect(() => {
    if (questions.length > 0 && !viewDocument) {
      // Set initial position to first question if none is focused
      const initializePosition = () => {
        if (!currentFocusedQuestionId && questions[0]) {
          const firstQuestionRect = document.getElementById(questions[0]._id)?.getBoundingClientRect();
          const containerRect = document.getElementsByClassName('question-form')[0]?.getBoundingClientRect();
          if (firstQuestionRect && containerRect) {
            const scrollTop = document.getElementsByClassName('question-form')[0].scrollTop;
            const relativeTop = firstQuestionRect.top - containerRect.top + scrollTop + 40;
            setYOffset(Math.max(0, relativeTop));
          }
        }
      };
      
      // Add small delay to ensure DOM elements are fully rendered
      setTimeout(initializePosition, 100);
    }
  }, [questions, viewDocument]);

  const updateDocument = (): void => {
    handlePromiseRequest(async () => {
      let payload = {
        _id: params.documentId,
        documentName,
        documentDescription,
        questions,
        updatedOn: getCurrentDateTime(),
      }
      await HttpRequestController(REQUEST_URLS.UPDATE_DOCUMENT, HTTP_METHODS.PUT, payload);
    }, SAVING, REQUEST_SUCCESS_MESSAGES.QUESTIONS_SAVED_SUCCESSFULLY, REQUEST_FAILURE_MESSAGES.SAVING_QUESTIONS_FAILED)
  }

  const handleValueChange = (question: Question, value: string, option?: string, checked?: boolean) => {
    if (question.questionType != QUESTION_TYPES.CHECKBOX) {
      setAnswers({ ...answers, [question._id]: value });
    } else {
      const selectedOptions = answers?.[question._id] ?? [];
      if (checked) {
        setAnswers({ ...answers, [question._id]: [...selectedOptions, option] });
      } else {
        const updatedOptions = selectedOptions.filter((selected: string) => selected !== option);
        return {
          ...answers,
          [question._id]: updatedOptions
        };
      }
    }
  };

  const checkAllRequiredQuestionsAreAnswered = (): boolean => {
    return questions.every((question: Question) => {
      if (question.required) {
        return answers?.hasOwnProperty(question._id);
      } else {
        return true;
      }
    });
  }

  const saveUserResponse = async (): Promise<void> => {
    if (checkAllRequiredQuestionsAreAnswered()) {
      let payload = {
        documentId: params.documentId,
        answers,
        userId: user.userId,
        username: user.username
      }
      await HttpRequestController(`${REQUEST_URLS.USER_RESPONSE}/${params.documentId}`, HTTP_METHODS.POST, payload);
      toast.success(REQUEST_SUCCESS_MESSAGES.REQUEST_SAVED_SUCCESSFULLY);
      navigate(`/thank-you/${params.documentId}`, { replace: true });
    }
  }

  const submitUserResponse = () => {
    if (checkAllRequiredQuestionsAreAnswered()) {
      handlePromiseRequest(saveUserResponse, SAVING, REQUEST_SUCCESS_MESSAGES.REQUEST_SAVED_SUCCESSFULLY, REQUEST_FAILURE_MESSAGES.SAVING_USER_RESPONSE_FAILED)
    } else {
      toast.error(REQUEST_FAILURE_MESSAGES.PLEASE_ANSWER_ALL_REQUIRED_QUESTIONS);
    }
  }

  const isElementBoxVisible = (): boolean => {
    const currentElement = document.getElementById(currentFocusedQuestionId);
    const containerElement = document.getElementsByClassName('question-form')[0];
    
    if (!currentElement || !containerElement) {
      return false;
    }
    
    const elementRect = currentElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();
    
    return elementRect.top >= containerRect.top && 
           elementRect.bottom <= containerRect.bottom && 
           elementRect.top < containerRect.bottom - 100; // Add some buffer
  }

  // Function to handle scroll event
  const handleScrollFunction = (event: any) => {
    const scrollTop = event.target.scrollTop;
    
    if (currentFocusedQuestionId && isElementBoxVisible()) {
      updateToolBoxPosition();
    } else if (currentFocusedQuestionId) {
      // Position toolkit relative to the focused question even if not visible
      const currentElement = document.getElementById(currentFocusedQuestionId);
      if (currentElement) {
        const elementRect = currentElement.getBoundingClientRect();
        const containerRect = document.getElementsByClassName('question-form')[0]?.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top + scrollTop + 40;
        setYOffset(Math.max(0, relativeTop));
      }
    }
  };

  const handleScroll = debounce(handleScrollFunction, 50);

  // updates tool box position when new question box is added
  const handleUpdateToolBoxPosition = (): void => {
    if (!currentFocusedQuestionId) {
      return;
    }
    
    const currentElement = document.getElementById(currentFocusedQuestionId);
    const containerElement = document.getElementsByClassName('question-form')[0];
    
    if (!currentElement || !containerElement) {
      return;
    }
    
    if (!isElementBoxVisible()) {
      currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // After scrolling, update position
      setTimeout(() => {
        const updatedElementRect = currentElement.getBoundingClientRect();
        const updatedContainerRect = containerElement.getBoundingClientRect();
        const scrollTop = containerElement.scrollTop;
        const targetTopRelativeToContainer = updatedElementRect.top - updatedContainerRect.top + scrollTop + 40;
        setYOffset(Math.max(0, targetTopRelativeToContainer));
      }, 300);
    } else {
      const accordionRect = currentElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      const scrollTop = containerElement.scrollTop;
      
      // Calculate position relative to the container with offset for proper alignment
      const targetTopRelativeToContainer = accordionRect.top - containerRect.top + scrollTop + 40;
      setYOffset(Math.max(0, targetTopRelativeToContainer));
    }
  }

  const updateToolBoxPosition = debounce(handleUpdateToolBoxPosition, 100);

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }
    let itemgg = [...questions];
    const itemF = reorder(
      itemgg,
      result.source.index,
      result.destination.index
    );
    dispatch({
      type: QUESTION_ACTION_TYPES.REORDER_QUESTIONS,
      payload: {
        questions: itemF as Question[]
      }
    });
    toast.success('Questions swapped', {
      position: "bottom-right"
    });
  }

  const reorder = (list: any, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const closeAllExpandedQuestion = (): void => {
    dispatch({ type: QUESTION_ACTION_TYPES.CLOSE_EXPANDED_QUESTIONS });
  }

  const handleExpand = (questionIndex: number): void => {
    dispatch({
      type: QUESTION_ACTION_TYPES.EXPAND_QUESTION,
      payload: { questionIndex }
    });
  }

  const updateQuestion = (question: string, questionIndex: number): void => {
    dispatch({
      type: QUESTION_ACTION_TYPES.UPDATE_QUESTION,
      payload: { questionIndex, questionText: question }
    });
  }

  const addQuestionTemplate = (): void => {
    closeAllExpandedQuestion();
    dispatch({ type: QUESTION_ACTION_TYPES.ADD_NEW_QUESTION });
    
    // Update toolkit position after new question is added with a longer delay to ensure DOM is updated
    setTimeout(() => {
      updateToolBoxPosition();
    }, 400);
    
    toast.success('Question added', {
      position: "bottom-right"
    });
  }

  const displayQuestions = () => {
    return questions.map((question: Question, i: any) => {
      return <Draggable key={question._id} draggableId={question._id} index={i} isDragDisabled={viewDocument}>
        {(provided) => (
          <div id={question._id} ref={provided.innerRef}  {...provided.draggableProps} {...provided.dragHandleProps}>
            <div>
              <div className={viewDocument ? "question-container add-margin" : "question-container"}>
                {
                  !viewDocument && (
                    <div className="drag-indicator-box">
                      <DragIndicatorIcon className="icon" fontSize="small" />
                    </div>
                  )
                }
                <Accordion onChange={() => {
                  if (!viewDocument) {
                    handleExpand(i);
                  }
                }} expanded={questions[i].open} className={questions[i].open ? "MuiAccordion-root add-border" : "MuiAccordion-root"}>
                  <AccordionSummary aria-controls="panel1-content" id="panel1-header">
                    {(!questions[i].open) && (
                      <DisplayQuestion questionIndex={i} question={question}
                        showQuestionPaper={viewDocument} onChange={handleValueChange} />
                    )}
                  </AccordionSummary>
                  <div className="question-box">
                    <AccordionDetails className="add-question">
                      <div>
                        <div className="add-question-top">
                          <textarea className="question"
                            placeholder="Question" value={question.question} onChange={(e) => { updateQuestion(e.target.value, i) }} />
                          {/* selection box to select question type  */}
                          <SelectBox questionIndex={i} question={question} />
                        </div>
                        {/* adding options */}
                        <OptionBox question={question} questionIndex={i} />
                        {/* question box footer with action buttons  */}
                        <QuestionBoxFooter isRequired={question.required} questionIndex={i} />
                      </div>
                    </AccordionDetails>
                  </div>
                </Accordion>
              </div>
            </div>
          </div >
        )
        }
      </Draggable >
    })
  }

  return (
    <div>
      <div className={viewDocument ? " question-form question-paper-full-height" : "question-form"} id="question-form" onScroll={handleScroll}>
        <div className="section">
          <div className="question-title-section">
            <div className="question-form-top">
              <input
                type="text"
                className="question-form-top-name"
                placeholder="Untitled form"
                value={documentName}
                onChange={(e) => {
                  dispatch({ type: QUESTION_ACTION_TYPES.UPDATE_DOCUMENT_NAME, payload: { documentName: e.target.value } });
                }}
                readOnly={viewDocument}
              />
              <input
                type="text"
                className="question-form-top-desc"
                placeholder="Document description"
                value={documentDescription}
                onChange={(e) => {
                  dispatch({ type: QUESTION_ACTION_TYPES.UPDATE_DOCUMENT_DESCRIPTION, payload: { documentDescription: e.target.value } });
                }}
                readOnly={viewDocument}
              />
            </div>
          </div>
          {
            questions && (<DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {displayQuestions()}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            )
          }

          <div className="save-form">
            <Button
              className="save-button"
              variant="contained"
              color="success"
              disabled={isRequestPending}
              onClick={!viewDocument ? updateDocument : submitUserResponse} >
              {viewDocument ? "Submit" : "Save"}
            </Button>
          </div>
        </div>
        {
          !viewDocument && (<div className="question-edit" style={{ top: `${yoffset}px` }}>
            <Tooltip title="Add question" placement="right">
              <AddCircleOutlineIcon className="edit add-question-btn" onClick={() => addQuestionTemplate()} />
            </Tooltip>
            <OndemandVideoIcon className="edit" />
            <CropOriginalIcon className="edit" />
            <TextFieldsIcon className="edit" />
          </div>)
        }
      </div>
      {/* display this edit icon when user is viewing the document */}
      {user.userId === createdByUserID && viewDocument && (
        <Tooltip title="Edit">
          <CreateIcon className="edit-question-paper-icon" onClick={() => dispatch({
            type: QUESTION_ACTION_TYPES.VIEW_DOCUMENT
          })} />
        </Tooltip>)
      }

      {user.userId === createdByUserID && viewDocument && (
        <div className="back-button">
          <Tooltip title="Go Back">
            <ArrowBackIosNewIcon className="edit-question-paper-icon" onClick={() => {
              dispatch({
                type: QUESTION_ACTION_TYPES.VIEW_DOCUMENT
              })
            }} />
          </Tooltip>
        </div>)
      }

    </div >
  )
}
