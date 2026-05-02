# AuthTokenResponseItem


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**accessToken** | **string** | The access token | [default to undefined]
**refreshToken** | **string** | The refresh token | [optional] [default to undefined]
**expiresAt** | **string** | The date and time when the token expires | [default to undefined]
**ttlSeconds** | **number** | Time to live in seconds | [default to undefined]
**action** | **string** |  | [default to undefined]

## Example

```typescript
import { AuthTokenResponseItem } from './api';

const instance: AuthTokenResponseItem = {
    accessToken,
    refreshToken,
    expiresAt,
    ttlSeconds,
    action,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
