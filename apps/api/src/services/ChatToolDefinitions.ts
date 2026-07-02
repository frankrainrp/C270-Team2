export const ChatTools = [
  {
    type: "function",
    function: {
      name: "create_item",
      description: "Create a new task or calendar item. Use this for assignments, exams, meetings, and deadlines.",
      parameters: {
        type: "object",
        properties: {
          taskName: { type: "string" },
          dueDate: { type: "string", description: "YYYY-MM-DD or empty string when unknown." },
          dueTime: { type: "string", description: "HH:MM. Default to 23:59 when not specified." },
          weight: { type: ["number", "null"] },
          description: { type: "string" },
          isGroupWork: { type: "boolean" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          tags: { type: "array", items: { type: "string" } },
          priority: { type: "string", enum: ["low", "med", "high"] },
          notes: { type: "string" },
        },
        required: ["taskName", "dueDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_item",
      description: "Update an existing task. Use itemId when available, otherwise use taskNameFuzzy.",
      parameters: {
        type: "object",
        properties: {
          itemId: { type: "string" },
          taskNameFuzzy: { type: "string" },
          taskName: { type: "string" },
          dueDate: { type: "string" },
          dueTime: { type: "string" },
          weight: { type: ["number", "null"] },
          description: { type: "string" },
          isGroupWork: { type: "boolean" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          tags: { type: "array", items: { type: "string" } },
          priority: { type: "string", enum: ["low", "med", "high"] },
          notes: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_item",
      description: "Delete a task. Use itemId when available, otherwise use taskNameFuzzy.",
      parameters: {
        type: "object",
        properties: {
          itemId: { type: "string" },
          taskNameFuzzy: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "toggle_complete",
      description: "Mark a task complete or incomplete.",
      parameters: {
        type: "object",
        properties: {
          itemId: { type: "string" },
          taskNameFuzzy: { type: "string" },
          completed: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_items",
      description: "List current user tasks before answering, updating, or deleting when needed.",
      parameters: {
        type: "object",
        properties: {
          filter: { type: "string", enum: ["all", "today", "thisWeek", "later", "completed", "active"] },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_note",
      description: "Create a markdown note draft.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["title", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_notes",
      description: "List current notes before answering, updating, or deleting when needed.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Optional title/content/tag search text." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_note",
      description: "Update an existing note. Use noteId when available, otherwise use titleFuzzy.",
      parameters: {
        type: "object",
        properties: {
          noteId: { type: "string" },
          titleFuzzy: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          pinned: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_note",
      description: "Delete an existing note. Use noteId when available, otherwise use titleFuzzy.",
      parameters: {
        type: "object",
        properties: {
          noteId: { type: "string" },
          titleFuzzy: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_custom_panel",
      description: "Create a custom dashboard or panel draft.",
      parameters: {
        type: "object",
        properties: {
          label: { type: "string" },
          emoji: { type: "string" },
          kind: { type: "string", enum: ["markdown", "iframe", "modules"] },
          content: { type: "string" },
          url: { type: "string" },
          modules: { type: "array", items: { type: "object" } },
        },
        required: ["label"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_recurring_task",
      description: "Create a recurring task template.",
      parameters: {
        type: "object",
        properties: {
          taskName: { type: "string" },
          cadence: { type: "string", enum: ["daily", "weekly", "monthly"] },
          timesPerPeriod: { type: "number" },
          dueTime: { type: "string" },
          description: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          emoji: { type: "string" },
        },
        required: ["taskName", "cadence"],
      },
    },
  },
] as const;
