import React, { useState } from 'react';
import { Button } from './ui/Button';
import { LayoutTemplate, Plus, Star, Clock, Zap } from 'lucide-react';

const REQUEST_TEMPLATES = [
  {
    id: 'get-user',
    name: 'Get User',
    description: 'Retrieve user information',
    method: 'GET',
    url: '/api/users/{id}',
    headers: [
      { key: 'Authorization', value: 'Bearer {token}', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    params: [
      { key: 'id', value: '123', enabled: true },
      { key: 'include', value: 'profile,preferences', enabled: true }
    ],
    body: '',
    category: 'users'
  },
  {
    id: 'create-post',
    name: 'Create Post',
    description: 'Create a new blog post',
    method: 'POST',
    url: '/api/posts',
    headers: [
      { key: 'Authorization', value: 'Bearer {token}', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    params: [],
    body: JSON.stringify({
      title: 'Sample Post',
      content: 'This is a sample post content',
      author: '{userId}',
      tags: ['sample', 'api']
    }, null, 2),
    category: 'content'
  },
  {
    id: 'update-profile',
    name: 'Update Profile',
    description: 'Update user profile information',
    method: 'PUT',
    url: '/api/users/profile',
    headers: [
      { key: 'Authorization', value: 'Bearer {token}', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    params: [],
    body: JSON.stringify({
      name: '{name}',
      email: '{email}',
      bio: 'Updated bio information',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    }, null, 2),
    category: 'users'
  },
  {
    id: 'upload-file',
    name: 'Upload File',
    description: 'Upload a file with multipart form data',
    method: 'POST',
    url: '/api/upload',
    headers: [
      { key: 'Authorization', value: 'Bearer {token}', enabled: true }
    ],
    params: [
      { key: 'folder', value: 'documents', enabled: true }
    ],
    body: 'File upload - use form-data in body tab',
    category: 'files'
  },
  {
    id: 'webhook-test',
    name: 'Webhook Test',
    description: 'Test webhook endpoint',
    method: 'POST',
    url: '/api/webhooks/test',
    headers: [
      { key: 'X-Webhook-Secret', value: '{webhookSecret}', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    params: [],
    body: JSON.stringify({
      event: 'test.webhook',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Webhook test payload',
        id: '{randomId}'
      }
    }, null, 2),
    category: 'webhooks'
  }
];

const RequestTemplates = ({ onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...new Set(REQUEST_TEMPLATES.map(t => t.category))];

  const filteredTemplates = REQUEST_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const applyTemplate = (template) => {
    // Replace template variables with sample values
    const processedTemplate = {
      ...template,
      url: template.url.replace(/\{([^}]+)\}/g, (match, varName) => {
        const samples = {
          id: '123',
          token: 'your-jwt-token-here',
          userId: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          webhookSecret: 'whsec_your_webhook_secret',
          randomId: Math.random().toString(36).substr(2, 9)
        };
        return samples[varName] || match;
      }),
      headers: template.headers.map(header => ({
        ...header,
        value: header.value.replace(/\{([^}]+)\}/g, (match, varName) => {
          const samples = {
            token: 'your-jwt-token-here',
            webhookSecret: 'whsec_your_webhook_secret'
          };
          return samples[varName] || match;
        })
      })),
      params: template.params.map(param => ({
        ...param,
        value: param.value.replace(/\{([^}]+)\}/g, (match, varName) => {
          const samples = {
            id: '123',
            userId: 'user123',
            randomId: Math.random().toString(36).substr(2, 9)
          };
          return samples[varName] || match;
        })
      })),
      body: template.body.replace(/\{([^}]+)\}/g, (match, varName) => {
        const samples = {
          userId: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          randomId: Math.random().toString(36).substr(2, 9),
          token: 'your-jwt-token-here',
          webhookSecret: 'whsec_your_webhook_secret'
        };
        return samples[varName] || match;
      })
    };

    onSelectTemplate(processedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <LayoutTemplate size={20} className="text-primary" />
            <h2 className="text-xl font-bold">Request Templates</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => applyTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    template.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                    template.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                    template.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {template.method}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mb-3 font-mono truncate">
                  {template.url}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap size={12} />
                    {template.category}
                  </span>
                  <span className="text-primary group-hover:underline">
                    Use Template →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <LayoutTemplate size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 text-center">
          <p className="text-sm text-muted-foreground">
            Templates include sample data with <code className="bg-muted px-1 rounded">{'{variable}'}</code> placeholders
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestTemplates;