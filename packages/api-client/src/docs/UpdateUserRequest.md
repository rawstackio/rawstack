# UpdateUserRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **string** |  | [optional] [default to undefined]
**password** | **string** |  | [optional] [default to undefined]
**roles** | **Array&lt;string&gt;** | Array of roles to assign to the user (ADMIN or VERIFIED_USER) | [optional] [default to undefined]

## Example

```typescript
import { UpdateUserRequest } from './api';

const instance: UpdateUserRequest = {
    email,
    password,
    roles,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
