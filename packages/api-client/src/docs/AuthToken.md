# AuthToken


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**accessToken** | **string** | The access token | [default to undefined]
**refreshToken** | **string** | The refresh token | [optional] [default to undefined]
**expiresAt** | **string** | The date and time when the token expires | [default to undefined]
**ttlSeconds** | **number** | Time to live in seconds | [default to undefined]

## Example

```typescript
import { AuthToken } from './api';

const instance: AuthToken = {
    accessToken,
    refreshToken,
    expiresAt,
    ttlSeconds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
