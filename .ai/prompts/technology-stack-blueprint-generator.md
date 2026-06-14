# Comprehensive Technology Stack Blueprint Generator

## Configuration Variables

${PROJECT_TYPE="Auto-detect|JavaScript|React.js|Other"} <!-- Primary technology (this repo is a React + Vite + TypeScript SPA) -->
${DEPTH_LEVEL="Basic|Standard|Comprehensive|Implementation-Ready"} <!-- Analysis depth -->
${INCLUDE_VERSIONS=true|false} <!-- Include version information -->
${INCLUDE_LICENSES=true|false} <!-- Include license information -->
${INCLUDE_DIAGRAMS=true|false} <!-- Generate architecture diagrams -->
${INCLUDE_USAGE_PATTERNS=true|false} <!-- Include code usage patterns -->
${INCLUDE_CONVENTIONS=true|false} <!-- Document coding conventions -->
${OUTPUT_FORMAT="Markdown|JSON|YAML|HTML"} <!-- Select output format -->
${CATEGORIZATION="Technology Type|Layer|Purpose"} <!-- Organization method -->

## Generated Prompt

"Analyze the codebase and generate a ${DEPTH_LEVEL} technology stack blueprint that thoroughly documents technologies and implementation patterns to facilitate consistent code generation. Use the following approach:

### 1. Technology Identification Phase

- ${PROJECT_TYPE == "Auto-detect" ? "Scan the codebase for project files, configuration files, and dependencies to determine all technology stacks in use" : "Focus on ${PROJECT_TYPE} technologies"}
- Identify all programming languages by examining file extensions and content
- Analyze configuration files (package.json, .csproj, pom.xml, etc.) to extract dependencies
- Examine build scripts and pipeline definitions for tooling information
- ${INCLUDE_VERSIONS ? "Extract precise version information from package files and configuration" : "Skip version details"}
- ${INCLUDE_LICENSES ? "Document license information for all dependencies" : ""}

### 2. Core Technologies Analysis

#### JavaScript / TypeScript Stack Analysis

- ECMAScript / TypeScript version and compiler settings (tsconfig)
- All npm dependencies (pnpm) categorized by purpose
- Module system (ESM) and path aliases (`#libs/*`)
- Build tooling (Vite) with configuration
- Testing frameworks and patterns (Vitest + React Testing Library + happy-dom)

#### React Analysis

- React version and key patterns (function components + hooks)
- State management approach (Jotai atoms, custom IoC via `#libs/ioc`)
- Styling approach (UnoCSS + CSS Modules)
- Routing implementation (`#libs/router`)
- Validation (Zod) and feature flags (`#libs/feature`)
- API integration patterns (injected services)
- Testing approach for components

### 3. Implementation Patterns & Conventions

${INCLUDE_CONVENTIONS ?
"Document coding conventions and patterns for each technology area:

#### Naming Conventions

- Class/type naming patterns
- Method/function naming patterns
- Variable naming conventions
- File naming and organization conventions
- Interface/abstract class patterns

#### Code Organization

- File structure and organization
- Folder hierarchy patterns
- Component/module boundaries
- Code separation and responsibility patterns

#### Common Patterns

- Error handling approaches
- Logging patterns
- Configuration access
- Authentication/authorization implementation
- Validation strategies
- Testing patterns" : ""}

### 4. Usage Examples

${INCLUDE_USAGE_PATTERNS ?
"Extract representative code examples showing standard implementation patterns:

#### API Implementation Examples

- Standard controller/endpoint implementation
- Request DTO pattern
- Response formatting
- Validation approach
- Error handling

#### Data Access Examples

- Repository pattern implementation
- Entity/model definitions
- Query patterns
- Transaction handling

#### Service Layer Examples

- Service class implementation
- Business logic organization
- Cross-cutting concerns integration
- Dependency injection usage

#### UI Component Examples (if applicable)

- Component structure
- State management pattern
- Event handling
- API integration pattern" : ""}

### 5. Technology Stack Map

${DEPTH_LEVEL == "Comprehensive" || DEPTH_LEVEL == "Implementation-Ready" ?
"Create a comprehensive technology map including:

#### Core Framework Usage

- Primary frameworks and their specific usage in the project
- Framework-specific configurations and customizations
- Extension points and customizations

#### Integration Points

- How different technology components integrate
- Authentication flow between components
- Data flow between frontend and backend
- Third-party service integration patterns

#### Development Tooling

- IDE settings and conventions
- Code analysis tools
- Linters and formatters with configuration
- Build and deployment pipeline
- Testing frameworks and approaches

#### Infrastructure

- Deployment environment details
- Container technologies
- Cloud services utilized
- Monitoring and logging infrastructure" : ""}

### 6. Technology-Specific Implementation Details

#### React Implementation Details

- **Component Structure**:
    - Function vs class components
    - Props interface definitions
    - Component composition patterns

- **Hook Usage Patterns**:
    - Custom hook implementation style
    - useState patterns
    - useEffect cleanup approaches
    - Context usage patterns

- **State Management**:
    - Local vs global state decisions
    - State management library patterns
    - Store configuration
    - Selector patterns

- **Styling Approach**:
    - CSS methodology (CSS modules, styled-components, etc.)
    - Theme implementation
    - Responsive design patterns

### 7. Blueprint for New Code Implementation

${DEPTH_LEVEL == "Implementation-Ready" ?
"Based on the analysis, provide a detailed blueprint for implementing new features:

- **File/Class Templates**: Standard structure for common component types
- **Code Snippets**: Ready-to-use code patterns for common operations
- **Implementation Checklist**: Standard steps for implementing features end-to-end
- **Integration Points**: How to connect new code with existing systems
- **Testing Requirements**: Standard test patterns for different component types
- **Documentation Requirements**: Standard doc patterns for new features" : ""}

${INCLUDE_DIAGRAMS ?
"### 8. Technology Relationship Diagrams

- **Stack Diagram**: Visual representation of the complete technology stack
- **Dependency Flow**: How different technologies interact
- **Component Relationships**: How major components depend on each other
- **Data Flow**: How data flows through the technology stack" : ""}

### ${INCLUDE_DIAGRAMS ? "9" : "8"}. Technology Decision Context

- Document apparent reasons for technology choices
- Note any legacy or deprecated technologies marked for replacement
- Identify technology constraints and boundaries
- Document technology upgrade paths and compatibility considerations

Format the output as ${OUTPUT_FORMAT} and categorize technologies by ${CATEGORIZATION}.

Save the output as 'tech_stack.${OUTPUT_FORMAT == "Markdown" ? "md" : OUTPUT_FORMAT.toLowerCase()}'
"
