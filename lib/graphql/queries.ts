import { gql } from '@apollo/client'

// Posts Queries
export const GET_POSTS = gql`
  query GetPosts($limit: Int, $offset: Int) {
    posts(limit: $limit, offset: $offset) {
      id
      title
      content
      media_urls
      media_type
      tags
      likes_count
      comments_count
      shares_count
      created_at
      updated_at
      author {
        id
        username
        display_name
        avatar_url
        role
      }
      user_liked
    }
  }
`

export const GET_POST_BY_ID = gql`
  query GetPostById($id: ID!) {
    post(id: $id) {
      id
      title
      content
      media_urls
      media_type
      tags
      likes_count
      comments_count
      shares_count
      created_at
      updated_at
      author {
        id
        username
        display_name
        avatar_url
        role
      }
      comments {
        id
        content
        likes_count
        created_at
        author {
          id
          username
          display_name
          avatar_url
        }
      }
      user_liked
    }
  }
`

// User/Profile Queries
export const GET_USER_PROFILE = gql`
  query GetUserProfile($username: String!) {
    userProfile(username: $username) {
      id
      user_id
      username
      display_name
      bio
      role
      location
      website
      avatar_url
      cover_url
      created_at
      followers_count
      following_count
      posts_count
      is_following
      is_followed_by
    }
  }
`

export const GET_CURRENT_USER_PROFILE = gql`
  query GetCurrentUserProfile {
    currentUserProfile {
      id
      user_id
      username
      display_name
      bio
      role
      location
      website
      avatar_url
      cover_url
      created_at
      followers_count
      following_count
      posts_count
    }
  }
`

// Opportunities Queries
export const GET_OPPORTUNITIES = gql`
  query GetOpportunities($limit: Int, $offset: Int) {
    opportunities(limit: $limit, offset: $offset) {
      id
      title
      company
      description
      location
      salary_min
      salary_max
      type
      tags
      applications_count
      created_at
      author {
        id
        username
        display_name
        avatar_url
      }
      user_applied
    }
  }
`

// Connections Queries
export const GET_CONNECTIONS = gql`
  query GetConnections($userId: ID!, $type: ConnectionType!) {
    connections(userId: $userId, type: $type) {
      id
      created_at
      user {
        id
        username
        display_name
        avatar_url
        bio
        role
        location
        followers_count
        following_count
        is_following
      }
    }
  }
`

export const GET_SUGGESTED_USERS = gql`
  query GetSuggestedUsers($limit: Int) {
    suggestedUsers(limit: $limit) {
      id
      username
      display_name
      avatar_url
      bio
      role
      location
      followers_count
      mutual_connections_count
    }
  }
`

// Messages Queries
export const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
      id
      updated_at
      participant {
        id
        username
        display_name
        avatar_url
        online_status
      }
      last_message {
        id
        content
        created_at
        read_at
      }
      unread_count
    }
  }
`

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!, $limit: Int, $offset: Int) {
    messages(conversationId: $conversationId, limit: $limit, offset: $offset) {
      id
      content
      media_url
      created_at
      read_at
      sender {
        id
        username
        display_name
        avatar_url
      }
    }
  }
`

// Search Queries
export const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $limit: Int) {
    searchUsers(query: $query, limit: $limit) {
      id
      username
      display_name
      avatar_url
      bio
      role
      location
      followers_count
      is_following
    }
  }
`

export const SEARCH_POSTS = gql`
  query SearchPosts($query: String!, $limit: Int, $offset: Int) {
    searchPosts(query: $query, limit: $limit, offset: $offset) {
      id
      title
      content
      media_urls
      tags
      likes_count
      comments_count
      created_at
      author {
        id
        username
        display_name
        avatar_url
      }
    }
  }
`