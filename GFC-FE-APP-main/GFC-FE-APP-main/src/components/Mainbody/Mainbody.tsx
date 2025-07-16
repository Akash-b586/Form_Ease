import { Button, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import StorageSharpIcon from '@mui/icons-material/StorageSharp';
import { useEffect, useState } from "react";
import { Card } from "./Card";
import { FOLDER_VIEW_TYPE, HTTP_METHODS, REQUEST_URLS, REQUEST_IN_PROGRESS, REQUEST_SUCCESS_MESSAGES, REQUEST_FAILURE_MESSAGES } from "../../utils/constants";
import "./Mainbody.scss";
import { useDocumentsName } from "components/contexts/documents-context";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import useAxios from "utils/axios";

export default function Mainbody() {
  // view document list in table or like files
  const [type, setType] = useState(FOLDER_VIEW_TYPE.FILE);
  const { filteredFiles, setFiles, files } = useDocumentsName();
  const navigate = useNavigate();
  const { HttpRequestController, isRequestPending, handlePromiseRequest } = useAxios();
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // opens the document
  const openForm = (documentId: string) => {
    navigate(`/forms/${documentId}`, { state: { edit: true } });
  }

  // Delete form function
  const deleteForm = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const sendDeleteRequest = async () => {
    if (!documentToDelete) return;
    
    const res = await HttpRequestController(REQUEST_URLS.DELETE_DOCUMENT + `/${documentToDelete}`, HTTP_METHODS.DELETE);
    if (res) {
      setFiles(files.filter((file: any) => {
        return file._id !== res.documentId
      }));
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDeleteConfirm = () => {
    handlePromiseRequest(sendDeleteRequest, REQUEST_IN_PROGRESS, REQUEST_SUCCESS_MESSAGES.DOCUMENT_DELETED_SUCCESSFULLY,
      REQUEST_FAILURE_MESSAGES.DOCUMENT_DELETION_FAILED);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  let [rows, setRows] = useState<any>([]);

  let columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'documentName', headerName: 'Document Name', flex: 1 },
    { field: 'createdOn', headerName: 'Created On', flex: 2 },
    { field: 'updatedOn', headerName: 'Updated On', flex: 2 },
    {
      field: "action",
      align: "center",
      flex: 2,
      headerName: "Actions",
      sortable: false,
      renderCell: (params: any) => {
        const onOpenClick = () => {
          openForm(filteredFiles[params.row.id - 1]._id);
        };
        
        const onDeleteClick = () => {
          deleteForm(filteredFiles[params.row.id - 1]._id);
        };
        
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="contained" color="primary" onClick={onOpenClick} size="small">
              Open
            </Button>
            <Button variant="outlined" color="error" onClick={onDeleteClick} size="small">
              Delete
            </Button>
          </div>
        );
      }
    }
  ];

  useEffect(() => {
    let data: { id: number, documentName: string; createdOn: string; updatedOn: string; }[] = [];
    filteredFiles.map((element: any, index: number) => {
      return data.push({ "id": index + 1, "documentName": element.documentName, "createdOn": element.createdOn, "updatedOn": element.updatedOn });
    });
    // showing the filtered files
    setRows(data);
  }, [filteredFiles]);

  return <div className="docs-section">
    <div className="header">
      <div className="header-left">
        Recent forms
      </div>

      <div className="header-right">
        <Tooltip title="Table View">
          <IconButton onClick={() => { setType(FOLDER_VIEW_TYPE.ROWS); }}>
            <StorageSharpIcon style={{ fontSize: "16px", color: "black" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Folder View">
          <IconButton onClick={() => { setType(FOLDER_VIEW_TYPE.FILE); }}>
            <FolderOpenSharpIcon style={{ fontSize: "16px", color: "black" }} />
          </IconButton>
        </Tooltip>
      </div>
    </div>

    {/* document details will be displayed like files  */}
    {type == FOLDER_VIEW_TYPE.FILE && (
      <div className="docs-container">
        {filteredFiles && filteredFiles.length > 0 ? (
          filteredFiles.map((ele: any, i: string) => <Card key={'id' + i} document={ele} openForm={openForm} deleteForm={deleteForm} />)
        ) : (
          <div style={{ textAlign: "center", fontSize: "20px" }}>
            No records found
          </div>
        )}
      </div>
    )}

    {/* document details will be displayed inside table  */}
    {type == FOLDER_VIEW_TYPE.ROWS && (
      <div style={{ maxHeight: "1000", display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%' }}>
          {
            (<DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 7]}
            />)
          }
        </div>
      </div>
    )}

    {/* Delete Confirmation Dialog */}
    <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
      <DialogTitle>Delete Form</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this form? This action cannot be undone.
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDeleteCancel} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleDeleteConfirm} 
          color="error" 
          variant="contained"
          disabled={isRequestPending}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  </div>
}
