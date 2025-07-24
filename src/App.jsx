import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Box,
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  Stack,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  MenuItem,
  Select,
  Chip,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";

const FILTERS = {
  ALL: "all",
  ACTIVE: "active",
  COMPLETED: "completed",
};

const PRIORITIES = ["Low", "Medium", "High"];

const ALL_LABELS = ["Work", "Personal", "Urgent", "Later", "Shopping", "Home"];

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [filter, setFilter] = useState(FILTERS.ALL);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Filtering tasks
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case FILTERS.ACTIVE:
        return tasks.filter((t) => !t.completed);
      case FILTERS.COMPLETED:
        return tasks.filter((t) => t.completed);
      case FILTERS.ALL:
      default:
        return tasks;
    }
  }, [tasks, filter]);

  // Add new task with default priority, labels and empty subtasks
  const handleAddTask = () => {
  if (!input.trim()) return; // Prevent adding empty tasks

  const newTask = {
    id: Date.now().toString(),  // unique id based on timestamp
    text: input.trim(),         // task title from input
    completed: false,           // default: not completed
    dueDate: null,              // no due date initially
    details: "",                // empty details
    comments: [],               // empty comments array
    priority: "Medium",         // default priority level
    labels: [],                 // no labels initially
    subtasks: [],               // empty subtasks list
  };

  setTasks((prevTasks) => [...prevTasks, newTask]); // add new task to state
  setInput(""); // clear input box
};

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleCompleted = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTasks(reordered);
  };

  const handleFilterChange = (e, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  const handleDarkModeToggle = () => setDarkMode((d) => !d);

  const openDetails = (task) => {
    setSelectedTask(task);
  };

  const closeDetails = () => {
    setSelectedTask(null);
  };

  // Update fields in selectedTask
  const updateSelectedTask = (field, value) => {
    setSelectedTask((prev) => ({ ...prev, [field]: value }));
  };

  // Save changes from dialog
  const saveTaskDetails = () => {
    setTasks((prev) =>
      prev.map((t) => (t.id === selectedTask.id ? selectedTask : t))
    );
    closeDetails();
  };

  // Comments add
  const addComment = (comment) => {
    if (!comment.trim()) return;
    updateSelectedTask("comments", [...selectedTask.comments, comment.trim()]);
  };

  // Subtasks functions
  const addSubtask = () => {
    const newSubtask = {
      id: Date.now().toString(),
      text: "",
      completed: false,
    };
    updateSelectedTask("subtasks", [...selectedTask.subtasks, newSubtask]);
  };

  const updateSubtask = (index, field, value) => {
    const newSubtasks = [...selectedTask.subtasks];
    newSubtasks[index] = { ...newSubtasks[index], [field]: value };
    updateSelectedTask("subtasks", newSubtasks);
  };

  const deleteSubtask = (index) => {
    const newSubtasks = [...selectedTask.subtasks];
    newSubtasks.splice(index, 1);
    updateSelectedTask("subtasks", newSubtasks);
  };

  // Analytics (optional, same as before)

  return (
    <Box
  sx={{
    bgcolor: darkMode ? "#121212" : "#f5f5f5",
    color: darkMode ? "#eee" : "#222",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    p: 2,
  }}
>
      <Container maxWidth="sm">

        
        
        <Typography variant="h4" align="center" gutterBottom>
          📝 MUI To-Do List
        </Typography>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={handleFilterChange}
            aria-label="task filter"
            size="small"
          >
            <ToggleButton value={FILTERS.ALL} aria-label="all tasks">
              All
            </ToggleButton>
            <ToggleButton value={FILTERS.ACTIVE} aria-label="active tasks">
              Active
            </ToggleButton>
            <ToggleButton value={FILTERS.COMPLETED} aria-label="completed tasks">
              Completed
            </ToggleButton>
          </ToggleButtonGroup>

          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={handleDarkModeToggle}
                color="primary"
              />
            }
            label="Dark Mode"
          />
        </Stack>

        <Box display="flex" mb={2} gap={1}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Add a new task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
            }}
            sx={{
              bgcolor: darkMode ? "#1e1e1e" : "white",
              input: { color: darkMode ? "white" : "black" },
            }}
          />
          <Button variant="contained" onClick={handleAddTask}>
            Add
          </Button>
        </Box>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <List
                component={Paper}
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  bgcolor: darkMode ? "#1e1e1e" : "white",
                  color: darkMode ? "white" : "black",
                }}
              >
                {filteredTasks.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No tasks here!"
                      sx={{ textAlign: "center", fontStyle: "italic" }}
                    />
                  </ListItem>
                )}

                {filteredTasks.map(({ id, text, completed, priority, labels, dueDate }, index) => (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(provided) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        secondaryAction={
                          <>
                            <IconButton
                              edge="end"
                              aria-label="details"
                              onClick={() => openDetails(tasks.find((t) => t.id === id))}
                              sx={{ mr: 1 }}
                            >
                              <InfoIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => handleDeleteTask(id)}
                              sx={{ color: darkMode ? "tomato" : "red" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        }
                        divider
                        sx={{
                          bgcolor: darkMode ? "#272727" : "#f9f9f9",
                          userSelect: "none",
                          textDecoration: completed ? "line-through" : "none",
                          color: completed ? "gray" : darkMode ? "white" : "black",
                          borderLeft: priority === "High" ? "5px solid red" :
                                      priority === "Medium" ? "5px solid orange" :
                                      "5px solid green",
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={completed}
                              onChange={() => toggleCompleted(id)}
                              sx={{
                                color: darkMode ? "white" : "primary.main",
                              }}
                            />
                          }
                          label={
                            <>
                              {text}{" "}
                              {labels.length > 0 && (
                                <>
                                  {labels.map((label) => (
                                    <Chip
                                      key={label}
                                      label={label}
                                      size="small"
                                      sx={{
                                        ml: 0.5,
                                        bgcolor: darkMode ? "#444" : "#ddd",
                                      }}
                                    />
                                  ))}
                                </>
                              )}
                              {dueDate && (
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color={darkMode ? "#bbb" : "#555"}
                                  sx={{ ml: 1 }}
                                >
                                  (Due: {new Date(dueDate).toLocaleDateString()})
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>
      
      
      
      </Container>

      {/* Task Details Dialog */}
      <Dialog open={!!selectedTask} onClose={closeDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Task Details</DialogTitle>
        {selectedTask && (
          <DialogContent>
            <TextField
              label="Task"
              fullWidth
              margin="normal"
              value={selectedTask.text}
              onChange={(e) => updateSelectedTask("text", e.target.value)}
            />

            <TextField
              label="Due Date"
              type="date"
              fullWidth
              margin="normal"
              value={selectedTask.dueDate ? selectedTask.dueDate.slice(0, 10) : ""}
              onChange={(e) => updateSelectedTask("dueDate", e.target.value || null)}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Priority"
              select
              fullWidth
              margin="normal"
              value={selectedTask.priority}
              onChange={(e) => updateSelectedTask("priority", e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              multiple
              freeSolo
              options={ALL_LABELS}
              value={selectedTask.labels}
              onChange={(e, newValue) => updateSelectedTask("labels", newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Labels / Tags"
                  placeholder="Add labels"
                  margin="normal"
                />
              )}
            />

            <TextareaAutosize
              minRows={3}
              placeholder="Details / Description"
              style={{
                width: "100%",
                marginTop: 16,
                padding: 8,
                fontSize: 16,
                borderRadius: 4,
                borderColor: "#ccc",
                backgroundColor: darkMode ? "#1e1e1e" : "white",
                color: darkMode ? "white" : "black",
              }}
              value={selectedTask.details}
              onChange={(e) => updateSelectedTask("details", e.target.value)}
            />

            <Box mt={3} mb={1} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Subtasks</Typography>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addSubtask}>
                Add Subtask
              </Button>
            </Box>

            {selectedTask.subtasks.length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No subtasks added yet.
              </Typography>
            )}

            <List dense>
              {selectedTask.subtasks.map((subtask, index) => (
                <ListItem
                  key={subtask.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => deleteSubtask(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <Checkbox
                    checked={subtask.completed}
                    onChange={(e) => updateSubtask(index, "completed", e.target.checked)}
                    sx={{ mr: 1 }}
                  />
                  <TextField
                    variant="standard"
                    value={subtask.text}
                    onChange={(e) => updateSubtask(index, "text", e.target.value)}
                    placeholder="Subtask text"
                    fullWidth
                    size="small"
                  />
                </ListItem>
              ))}
            </List>

            <Box mt={3}>
              <Typography variant="subtitle1">Comments</Typography>
              <List dense>
                {selectedTask.comments.map((c, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={c} />
                  </ListItem>
                ))}
              </List>
              <TextField
                placeholder="Add comment"
                fullWidth
                size="small"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    addComment(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </Box>
          </DialogContent>
        )}

        <DialogActions>
          <Button onClick={closeDetails}>Cancel</Button>
          <Button variant="contained" onClick={saveTaskDetails}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;


