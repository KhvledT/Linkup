import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function DropDown({  postId, commentId, handleEditPost , handleDeletePost, handleDeleteComment, editCommentPreview , Type}) {
    const { themeColors } = useTheme();

    function handleEdit()
      {if(Type === "post") {
        handleEditPost(postId);
      }else if(Type === "comment") {
        editCommentPreview(commentId);
      }}

      
    function handleDelete() {
      if(Type === "post") {
        handleDeletePost(postId);
      }else if(Type === "comment") {
        handleDeleteComment(commentId);
      }}


  return (
    <>
        <Dropdown>
          <DropdownTrigger>
            <Button 
              isIconOnly 
              variant="light" 
              className="text-lg font-bold"
              style={{ 
                color: themeColors.textSecondary,
                backgroundColor: 'transparent'
              }}
            >
              ⋮
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Post Actions"
            classNames={{
              base: "custom-dropdown-menu",
              content: "custom-dropdown-content"
            }}
          >
            <DropdownItem 
              onPress={() => handleEdit()} 
              key="edit"
              className="custom-dropdown-item"
              style={{ color: themeColors.text }}
            >
              {"Edit "+Type}
            </DropdownItem>
            <DropdownItem 
              onPress={() => handleDelete()} 
              key="delete" 
              className="custom-dropdown-item-danger"
              style={{ color: themeColors.primary }}
            >
              {"Delete "+Type}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
    
    </>
  )
}
