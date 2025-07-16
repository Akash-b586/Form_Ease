import React, { memo, useState } from "react";
import MoreVertSharpIcon from '@mui/icons-material/MoreVertSharp';
import StorageSharpIcon from '@mui/icons-material/StorageSharp';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import formimage from "../../assets/images/t-shirt.png";
import "./Mainbody.scss"

// displaying document name, created time on home page
export const Card: React.FC<any> = memo(({ document, openForm, deleteForm }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent card click
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    deleteForm(document._id);
    handleClose();
  };

  const handleCardClick = () => {
    // Opens the document - event stopping is handled by the action area
    openForm(document._id);
  };

  return <div className="doc-card" onClick={handleCardClick}>
    <img src={formimage} alt="no-image" className="doc-image"></img>
    <div className="doc-content">
      <div className="doc-info">
        <p className="doc-name">{document.documentName}</p>
        <div className="doc-last-opened-time">
          <div className="content_left">
            <StorageSharpIcon className="storage-icon" />
            {document.updatedOn}
          </div>
        </div>
      </div>

      <div className="doc-action" onClick={(e) => e.stopPropagation()}>
        <IconButton onClick={handleClick} size="small">
          <MoreVertSharpIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()} // Prevent card click when clicking menu
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          MenuListProps={{
            onClick: (e) => e.stopPropagation() // Also prevent on menu list
          }}
        >
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>
      </div>
    </div>
  </div>
});
