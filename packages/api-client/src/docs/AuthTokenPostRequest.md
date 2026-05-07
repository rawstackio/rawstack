# AuthTokenPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **string** |  | [default to undefined]
**password** | **string** |  | [optional] [default to undefined]
**refreshToken** | **string** |  | [optional] [default to undefined]
**role** | **string** | Optional role to assign during token creation (only ADMIN role is supported) | [optional] [default to undefined]
**invalidateTokens** | **boolean** | If true, invalidates all existing tokens for this user before creating a new one | [optional] [default to undefined]

## Example

```typescript
import { AuthTokenPostRequest } from './api';

const instance: AuthTokenPostRequest = {
    email,
    password,
    refreshToken,
    role,
    invalidateTokens,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
