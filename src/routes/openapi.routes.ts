import { Router } from "express";
import type { RequestHandler } from "express";

const router = Router();

const openapiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Notes API",
    version: "1.0.0",
    description: "A multi-user notes service REST API",
  },
  servers: [
    {
      url: process.env.BASE_URL || "http://localhost:3000",
      description: "Server",
    },
  ],

  // ─── Reusable Components ───────────────────────────────────────────────────
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {

      // Note shape returned by all note endpoints
      Note: {
        type: "object",
        properties: {
          id: { type: "string", example: "664f1c2e8b1e4a2d88c9a123" },
          title: { type: "string", example: "My Note" },
          content: { type: "string", example: "This is the note content" },
          isPinned: { type: "boolean", example: false },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },

      // Generic error shape { message: "..." }
      Error: {
        type: "object",
        properties: {
          message: { type: "string", example: "Error message here" },
        },
      },

    },
  },

  // ─── All Endpoints ─────────────────────────────────────────────────────────
  paths: {

    // ── POST /register ───────────────────────────────────────────────────────
    "/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", minLength: 6, example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "User registered successfully" },
                  },
                },
              },
            },
          },
          400: { description: "Email and password are required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── POST /login ──────────────────────────────────────────────────────────
    "/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get a JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful — returns JWT token",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    access_token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                  },
                },
              },
            },
          },
          400: { description: "Email and password are required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          401: { description: "Invalid email or password", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── GET /notes ───────────────────────────────────────────────────────────
    "/notes": {
      get: {
        tags: ["Notes"],
        summary: "Get all notes",
        description: "Returns all notes owned by or shared with the authenticated user. Pinned notes appear first.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            required: false,
            schema: { type: "integer", default: 1, minimum: 1 },
            description: "Page number (default: 1)",
            example: 1,
          },
          {
            in: "query",
            name: "limit",
            required: false,
            schema: { type: "integer", default: 10, minimum: 1, maximum: 50 },
            description: "Notes per page — max 50 (default: 10)",
            example: 10,
          },
        ],
        responses: {
          200: {
            description: "Paginated list of notes — pinned first",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Note" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        total: { type: "integer", example: 25 },
                        page: { type: "integer", example: 1 },
                        limit: { type: "integer", example: 10 },
                        totalPages: { type: "integer", example: 3 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      // ── POST /notes ──────────────────────────────────────────────────────
      post: {
        tags: ["Notes"],
        summary: "Create a new note",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", example: "Shopping List" },
                  content: { type: "string", example: "Buy milk and eggs" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Note created successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/Note" } } } },
          400: { description: "Title and content are required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── GET /notes/search ────────────────────────────────────────────────────
    "/notes/search": {
      get: {
        tags: ["Notes"],
        summary: "Full text search across notes",
        description: "Searches title and content of all notes owned or shared with the user. Results sorted by relevance.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "q",
            required: true,
            schema: { type: "string" },
            description: "Search keyword",
            example: "milk",
          },
        ],
        responses: {
          200: {
            description: "Matching notes sorted by relevance",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Note" } },
              },
            },
          },
          400: { description: "Query parameter q is required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── /notes/:id ───────────────────────────────────────────────────────────
    "/notes/{id}": {
      get: {
        tags: ["Notes"],
        summary: "Get a specific note by ID",
        description: "Only accessible by owner or users the note is shared with.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" }, description: "Note ID", example: "664f1c2e8b1e4a2d88c9a123" },
        ],
        responses: {
          200: { description: "Note data", content: { "application/json": { schema: { $ref: "#/components/schemas/Note" } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "You do not have access to this note", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          404: { description: "Note not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },

      put: {
        tags: ["Notes"],
        summary: "Update a note",
        description: "Only the owner can update a note.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" }, description: "Note ID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", example: "Updated Title" },
                  content: { type: "string", example: "Updated content" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Updated note data", content: { "application/json": { schema: { $ref: "#/components/schemas/Note" } } } },
          400: { description: "Title and content are required", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "You are not allowed to update this note", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          404: { description: "Note not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },

      delete: {
        tags: ["Notes"],
        summary: "Delete a note",
        description: "Only the owner can delete a note.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" }, description: "Note ID" },
        ],
        responses: {
          204: { description: "Note deleted — no content returned" },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "You are not allowed to delete this note", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          404: { description: "Note not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── POST /notes/:id/share ────────────────────────────────────────────────
    "/notes/{id}/share": {
      post: {
        tags: ["Notes"],
        summary: "Share a note with another user",
        description: "Only the owner can share. After sharing, the target user can access via GET /notes/:id",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" }, description: "Note ID" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["share_with_email"],
                properties: {
                  share_with_email: { type: "string", format: "email", example: "friend@example.com" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Note shared successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Note shared successfully" },
                  },
                },
              },
            },
          },
          400: { description: "share_with_email is required or cannot share with yourself", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "You are not allowed to share this note", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          404: { description: "Note not found or no user found with that email", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          409: { description: "Note is already shared with this user", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── PATCH /notes/:id/pin ─────────────────────────────────────────────────
    "/notes/{id}/pin": {
      patch: {
        tags: ["Notes"],
        summary: "Toggle pin state of a note",
        description: "Pinned notes always appear first in GET /notes. Only owner can pin.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" }, description: "Note ID" },
        ],
        responses: {
          200: {
            description: "Pin toggled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Note pinned" },
                    isPinned: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          403: { description: "You are not allowed to pin this note", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          404: { description: "Note not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          500: { description: "Internal server error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    // ── GET /about ───────────────────────────────────────────────────────────
    "/about": {
      get: {
        tags: ["General"],
        summary: "About this API and its developer",
        responses: {
          200: {
            description: "Developer info and features",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Your Name" },
                    email: { type: "string", example: "your@email.com" },
                    "my features": {
                      type: "object",
                      example: {
                        "Note Pinning": "Pin important notes so they always appear at the top.",
                        "Full Text Search": "Search notes by keyword across title and content.",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── GET /openapi.json ────────────────────────────────────────────────────
    "/openapi.json": {
      get: {
        tags: ["General"],
        summary: "OpenAPI 3.0 specification for this API",
        responses: {
          200: { description: "OpenAPI JSON spec" },
        },
      },
    },

  },
};

// GET /openapi.json
const getOpenApiSpec: RequestHandler = (req, res) => {
  res.status(200).json(openapiSpec);
};

router.get("/openapi.json", getOpenApiSpec);

export default router;