# From the Wild West to New Order: Bringing Structure to React

When I first moved from strongly typed, object‑oriented languages like C++ and C# into React, it felt like the Wild West. React and Node.js gave me incredible freedom—DOM updates here, API calls there, hooks everywhere. But with that freedom came chaos: code scattered across components, business logic leaking into UI, and regressions that were hard to trace.

I realized freedom without order doesn’t scale. If I wanted maintainability, testability, and a team that could move fast without breaking things, I needed to impose structure.

Here’s the journey from Wild West to New Order, and the principles that made it work.

## 1) The problem: flexible, but fragile

- Hooks and effects became grab bags where logic accumulated.
- Changing one part of the UI could quietly break another.
- Onboarding took too long because “where does X live?” had a different answer each time.
- Tests were hard to write because side effects weren’t contained.

### Before: The Wild West Component

```jsx
// components/UserDashboard.jsx - Everything in one place!
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // Effect #1: Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/user');
        setUser(response.data);
        // Oh, and update the document title while we're here
        document.title = `Dashboard - ${response.data.name}`;
        // And save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(response.data));
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Direct DOM manipulation
        document.getElementById('error-banner').style.display = 'block';
      }
    };
    fetchUser();
  }, []);

  // Effect #2: Fetch posts (depends on user)
  useEffect(() => {
    if (user) {
      const fetchPosts = async () => {
        const response = await axios.get(`/api/users/${user.id}/posts`);
        setPosts(response.data);
        setLoading(false);
        // Business logic mixed in
        if (response.data.length > 10) {
          setTheme('dark'); // Why? Who knows!
        }
      };
      fetchPosts();
    }
  }, [user]);

  // Effect #3: Theme handling
  useEffect(() => {
    document.body.className = theme;
    // More direct DOM manipulation
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.style.backgroundColor = theme === 'dark' ? '#333' : '#fff';
    }
  }, [theme]);

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
      // Inline business logic
      if (posts.length - 1 <= 5) {
        setTheme('light');
      }
    } catch (error) {
      alert('Failed to delete post'); // Great UX!
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`dashboard ${theme}`}>
      <h1>Welcome, {user?.name}</h1>
      <div className="posts">
        {posts.map(post => (
          <div key={post.id} className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <button onClick={() => handleDeletePost(post.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
```

### Before: File Structure (Wild West)

```
src/
├── components/
│   ├── UserDashboard.jsx          # 150+ lines, does everything
│   ├── PostList.jsx               # Also fetches data directly
│   ├── Header.jsx                 # Has its own API calls
│   └── utils.js                   # Random helper functions
├── api/
│   └── endpoints.js               # Hard-coded URLs everywhere
├── styles/
│   └── main.css                   # Global styles, no organization
└── App.js                         # More business logic here too
```

![Before: logic and side‑effects scattered across a component](img/wild-west-to-new-order/01-before-component.png)
*Before: logic and side‑effects scattered across a component.*

## 2) The turning point: traceability and flow

I reframed the goal: every change should be traceable, and every flow should be self‑documenting. If a new developer—or an AI assistant—opens the repo, they should be able to see “what talks to what” without guessing.

## 3) The New Order: five pillars

### Separation of concerns

- UI handles rendering and user events only.
- IO (HTTP, storage) happens in designated services.
- Business rules live in pure functions that are easy to test.
- DOM changes happen in a single, known layer.

### After: New Order File Structure

```
src/
├── ui/
│   ├── components/
│   │   ├── UserDashboard/
│   │   │   ├── UserDashboard.jsx      # Pure UI component
│   │   │   ├── UserDashboard.test.js  # Component tests
│   │   │   └── index.js               # Clean exports
│   │   └── PostList/
│   │       ├── PostList.jsx
│   │       ├── PostList.test.js
│   │       └── index.js
│   └── hooks/
│       ├── useUserDashboard.js        # Custom hook for state
│       └── useTheme.js                # Theme logic separated
├── domain/
│   ├── user/
│   │   ├── user.model.js              # User entity
│   │   ├── user.rules.js              # Business rules
│   │   └── user.test.js               # Domain tests
│   └── post/
│       ├── post.model.js
│       ├── post.rules.js
│       └── post.test.js
├── services/
│   ├── api/
│   │   ├── userService.js             # User API calls
│   │   ├── postService.js             # Post API calls
│   │   └── httpClient.js              # Configured axios
│   ├── storage/
│   │   └── localStorage.js            # Storage abstraction
│   └── dom/
│       └── domService.js              # DOM manipulation
├── infra/
│   ├── conductor/
│   │   ├── eventBus.js                # Event orchestration
│   │   ├── topics.js                  # Event topic definitions
│   │   └── conductor.test.js
│   ├── config/
│   │   ├── component.mapper.json      # Component configuration
│   │   ├── theme.config.json          # Theme definitions
│   │   └── api.config.json            # API endpoints
│   └── logger/
│       └── logger.js                  # Centralized logging
└── App.js                             # Minimal bootstrap
```

![Separation of concerns reflected in the folder structure](img/wild-west-to-new-order/02-folder-structure.png)
*Separation of concerns reflected in the folder structure.*

### One source of truth: JSON‑driven configuration

- Predictable sequences, subscriptions, and component wiring live in JSON.
- Example: component.mapper.json declares component types, control panel fields, and allowed CSS classes.
- Benefits: self‑documentation, easier code reviews, safer AI‑assisted edits, and no hard‑coded mappings sprinkled through the code.

### After: JSON-Driven Component Configuration

```json
// infra/config/component.mapper.json
{
  "components": {
    "UserDashboard": {
      "type": "container",
      "controlPanel": {
        "fields": [
          {
            "name": "theme",
            "type": "select",
            "options": ["light", "dark", "auto"],
            "default": "light"
          },
          {
            "name": "postsPerPage",
            "type": "number",
            "min": 5,
            "max": 50,
            "default": 10
          },
          {
            "name": "showUserAvatar",
            "type": "boolean",
            "default": true
          }
        ],
        "cssClasses": {
          "allowed": [
            "dashboard-compact",
            "dashboard-wide",
            "high-contrast",
            "mobile-optimized"
          ],
          "default": ["dashboard-wide"]
        }
      },
      "events": {
        "subscribes": ["user.loaded", "theme.changed"],
        "publishes": ["dashboard.rendered", "posts.requested"]
      }
    },
    "PostList": {
      "type": "list",
      "controlPanel": {
        "fields": [
          {
            "name": "layout",
            "type": "select",
            "options": ["grid", "list", "cards"],
            "default": "cards"
          }
        ],
        "cssClasses": {
          "allowed": ["post-grid", "post-list", "post-cards"],
          "default": ["post-cards"]
        }
      },
      "events": {
        "subscribes": ["posts.loaded"],
        "publishes": ["post.selected", "post.deleted"]
      }
    }
  }
}
```

### After: Clean Component Implementation

```jsx
// ui/components/UserDashboard/UserDashboard.jsx
import React from 'react';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import { PostList } from '../PostList';

const UserDashboard = ({ config, cssClasses = [] }) => {
  const {
    user,
    posts,
    loading,
    theme,
    handleDeletePost
  } = useUserDashboard(config);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`dashboard ${theme} ${cssClasses.join(' ')}`}>
      <h1>Welcome, {user?.name}</h1>
      <PostList
        posts={posts}
        onDelete={handleDeletePost}
        layout={config.layout || 'cards'}
      />
    </div>
  );
};

export default UserDashboard;
```

```js
// ui/hooks/useUserDashboard.js
import { useState, useEffect } from 'react';
import { userService } from '../../services/api/userService';
import { postService } from '../../services/api/postService';
import { eventBus } from '../../infra/conductor/eventBus';
import { applyThemeRules } from '../../domain/user/user.rules';

export const useUserDashboard = (config) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(config.theme || 'light');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Clean service calls
        const userData = await userService.getCurrentUser();
        const postsData = await postService.getUserPosts(userData.id);

        setUser(userData);
        setPosts(postsData);

        // Business rules applied cleanly
        const newTheme = applyThemeRules(postsData, config);
        setTheme(newTheme);

        // Events published for other components
        eventBus.publish('user.loaded', userData);
        eventBus.publish('dashboard.rendered', { user: userData, posts: postsData });

        setLoading(false);
      } catch (error) {
        eventBus.publish('error.occurred', { context: 'dashboard', error });
      }
    };

    loadDashboard();
  }, [config]);

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      const updatedPosts = posts.filter(p => p.id !== postId);
      setPosts(updatedPosts);

      // Business rule: theme adjustment
      const newTheme = applyThemeRules(updatedPosts, config);
      setTheme(newTheme);

      eventBus.publish('post.deleted', { postId, remainingCount: updatedPosts.length });
    } catch (error) {
      eventBus.publish('error.occurred', { context: 'post-deletion', error });
    }
  };

  return { user, posts, loading, theme, handleDeletePost };
};
```

![JSON‑driven configuration: components, fields, and classes defined declaratively](img/wild-west-to-new-order/03-json-source-of-truth.png)
*JSON‑driven configuration: components, fields, and classes defined declaratively.*

![Control Panel: fields and classes driven from JSON](img/wild-west-to-new-order/04-control-panel.png)
*Control Panel: fields and classes driven from JSON.*

### Event orchestration

- An event bus (the “conductor”) coordinates communication across components and services.
- Clear topics, payload shapes, and who publishes/subscribes.
- This reduces tight coupling and makes flows observable.

### After: Event Bus Implementation

```js
// infra/conductor/eventBus.js
import { logger } from '../logger/logger';

class EventBus {
  constructor() {
    this.subscribers = new Map();
    this.correlationId = 0;
  }

  subscribe(topic, handler, context = 'unknown') {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }

    this.subscribers.get(topic).push({ handler, context });
    logger.info(`Subscribed to ${topic}`, { context, topic });
  }

  publish(topic, payload = {}) {
    const correlationId = ++this.correlationId;
    const timestamp = new Date().toISOString();

    logger.info(`Publishing ${topic}`, {
      topic,
      correlationId,
      timestamp,
      payload: JSON.stringify(payload).substring(0, 100)
    });

    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).forEach(({ handler, context }) => {
        try {
          handler({ ...payload, correlationId, timestamp });
          logger.debug(`Handler executed for ${topic}`, { context, correlationId });
        } catch (error) {
          logger.error(`Handler failed for ${topic}`, {
            context,
            correlationId,
            error: error.message
          });
        }
      });
    }
  }
}

export const eventBus = new EventBus();
```

```js
// infra/conductor/topics.js - Self-documenting event contracts
export const TOPICS = {
  USER: {
    LOADED: 'user.loaded',
    UPDATED: 'user.updated',
    LOGGED_OUT: 'user.logged_out'
  },
  POSTS: {
    LOADED: 'posts.loaded',
    CREATED: 'post.created',
    DELETED: 'post.deleted',
    SELECTED: 'post.selected'
  },
  UI: {
    THEME_CHANGED: 'theme.changed',
    DASHBOARD_RENDERED: 'dashboard.rendered',
    MODAL_OPENED: 'modal.opened'
  },
  ERRORS: {
    OCCURRED: 'error.occurred',
    RESOLVED: 'error.resolved'
  }
};

// Event payload schemas for documentation
export const SCHEMAS = {
  [TOPICS.USER.LOADED]: {
    id: 'string',
    name: 'string',
    email: 'string',
    preferences: 'object'
  },
  [TOPICS.POSTS.DELETED]: {
    postId: 'string',
    remainingCount: 'number'
  },
  [TOPICS.ERRORS.OCCURRED]: {
    context: 'string',
    error: 'Error',
    correlationId: 'string'
  }
};
```

![Event bus: clear topics and payloads enable traceable flows](img/wild-west-to-new-order/05-event-bus-logs.png)
*Event bus: clear topics and payloads enable traceable flows.*

### Guardrails: linting, tests, and CI

- ESLint rules enforce architecture (e.g., “UI cannot import data layer directly”).
- Unit tests for pure logic, integration tests for service boundaries, and E2E for flows.
- CI runs everything, so regressions are caught before merge.

### After: Custom ESLint Rules

```js
// .eslintrc.js - Architecture enforcement
module.exports = {
  rules: {
    // Custom rules to enforce separation of concerns
    'no-direct-service-import': 'error',
    'no-dom-in-domain': 'error',
    'require-event-topics': 'error'
  },
  overrides: [
    {
      files: ['src/ui/**/*.js', 'src/ui/**/*.jsx'],
      rules: {
        // UI layer restrictions
        'import/no-restricted-paths': [
          'error',
          {
            zones: [
              {
                target: './src/ui',
                from: './src/services',
                message: 'UI should not import services directly. Use hooks or context.'
              },
              {
                target: './src/ui',
                from: './src/domain',
                message: 'UI should not import domain logic directly.'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['src/domain/**/*.js'],
      rules: {
        // Domain layer restrictions
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['react', 'react-dom'],
                message: 'Domain logic should not depend on React.'
              },
              {
                group: ['axios', 'fetch'],
                message: 'Domain logic should not make HTTP calls directly.'
              }
            ]
          }
        ]
      }
    }
  ]
};
```

### After: Testable Business Logic

```js
// domain/user/user.rules.test.js
import { applyThemeRules, validateUserPreferences } from './user.rules';

describe('User Business Rules', () => {
  describe('applyThemeRules', () => {
    it('should return dark theme for users with many posts', () => {
      const posts = Array(15).fill({ id: 1, title: 'Post' });
      const config = { theme: 'auto' };

      const result = applyThemeRules(posts, config);

      expect(result).toBe('dark');
    });

    it('should respect explicit theme preference', () => {
      const posts = Array(15).fill({ id: 1, title: 'Post' });
      const config = { theme: 'light' };

      const result = applyThemeRules(posts, config);

      expect(result).toBe('light');
    });

    it('should default to light theme for few posts', () => {
      const posts = Array(3).fill({ id: 1, title: 'Post' });
      const config = { theme: 'auto' };

      const result = applyThemeRules(posts, config);

      expect(result).toBe('light');
    });
  });
});
```

```js
// domain/user/user.rules.js - Pure, testable business logic
export const applyThemeRules = (posts, config) => {
  // Explicit preference always wins
  if (config.theme !== 'auto') {
    return config.theme;
  }

  // Business rule: many posts = dark theme for better readability
  return posts.length > 10 ? 'dark' : 'light';
};

export const validateUserPreferences = (preferences) => {
  const errors = [];

  if (!preferences.theme || !['light', 'dark', 'auto'].includes(preferences.theme)) {
    errors.push('Invalid theme preference');
  }

  if (preferences.postsPerPage < 5 || preferences.postsPerPage > 50) {
    errors.push('Posts per page must be between 5 and 50');
  }

  return { isValid: errors.length === 0, errors };
};
```

![ESLint guardrails preventing architecture violations](img/wild-west-to-new-order/06-eslint-guardrails.png)
*ESLint guardrails preventing architecture violations.*

![Fast feedback: unit tests validate pure business logic](img/wild-west-to-new-order/07-unit-tests.png)
*Fast feedback: unit tests validate pure business logic.*

![End‑to‑end tests confirm behavior across boundaries](img/wild-west-to-new-order/08-e2e-tests.png)
*End‑to‑end tests confirm behavior across boundaries.*

![CI enforces quality and catches regressions before merge](img/wild-west-to-new-order/09-ci-pipeline.png)
*CI enforces quality and catches regressions before merge.*

### Observability: logs with context

- Centralized logging through the conductor provides consistent context (component, event, correlation id).
- When something breaks, we can follow the trail.

![Structured logs: trace behavior by component, event, and correlation id](img/wild-west-to-new-order/10-observability-logs.png)
*Structured logs: trace behavior by component, event, and correlation id.*

## 4) What changed (results)

- Faster onboarding: new contributors can read the JSON and understand the system.
- Fewer regressions: side effects are constrained and tested.
- Safer iteration: changes in config don’t require risky cross‑cutting code edits.
- Better AI collaboration: agents can follow the self‑documented flow.

![Refactor with confidence: UI unchanged, internals improved](img/wild-west-to-new-order/11-before-after-ui.png)
*Refactor with confidence: UI unchanged, internals improved.*

![Iterate safely: change behavior via JSON, not cross‑cutting edits](img/wild-west-to-new-order/12-json-driven-change.png)
*Iterate safely: change behavior via JSON, not cross‑cutting edits.*

## 5) Lessons I didn’t expect

- React isn’t the problem—unbounded flexibility is. Add structure and it scales.
- My OOP mindset still helps, but I apply it differently: composition over inheritance, configuration over hard‑coding, events over direct calls.
- Node.js shines when it powers not just the app but the workflow: linting, testing, CI/CD, and tooling.

## Closing

If your React app feels like the Wild West, don’t fight the framework—frame the work. Separate concerns, move knowledge into JSON, let a conductor orchestrate events, and put guardrails around the system. Freedom is great. Freedom with order is scalable.

## Appendix: quick definitions

- Event bus / conductor: a simple publish/subscribe layer that coordinates inter‑component communication with named topics and typed payloads.
- Service mesh (in this context): the collection of app‑level services (e.g., logger, HTTP client, storage) provided to components in a consistent way.

