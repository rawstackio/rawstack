# UserApi

All URIs are relative to *http://localhost:3000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createUser**](#createuser) | **POST** /user/users | Creates a new User|
|[**deleteUser**](#deleteuser) | **DELETE** /user/users/{id} | Deletes a user|
|[**getCurrentUser**](#getcurrentuser) | **GET** /user/users/current | Returns the current user|
|[**getUser**](#getuser) | **GET** /user/users/{id} | Returns a user|
|[**listUsers**](#listusers) | **GET** /user/users | Returns a list of Users|
|[**updateUser**](#updateuser) | **PATCH** /user/users/{id} | Updates a user|

# **createUser**
> UserResponse createUser(userPostRequest)


### Example

```typescript
import {
    UserApi,
    Configuration,
    UserPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userPostRequest: UserPostRequest; //

const { status, data } = await apiInstance.createUser(
    userPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userPostRequest** | **UserPostRequest**|  | |


### Return type

**UserResponse**

### Authorization

[BearerToken](../README.md#BearerToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**409** | User not found |  -  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteUser**
> deleteUser()

Deletes a user

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deleteUser(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[BearerToken](../README.md#BearerToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | OK |  -  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCurrentUser**
> UserResponse getCurrentUser()

Returns the current user

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.getCurrentUser();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserResponse**

### Authorization

[BearerToken](../README.md#BearerToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUser**
> UserResponse getUser()

Returns a user

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.getUser(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**UserResponse**

### Authorization

[BearerToken](../README.md#BearerToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listUsers**
> UserListResponse listUsers()

Returns a list of Users to admin users only

### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let page: number; // (optional) (default to undefined)
let perPage: number; // (optional) (default to undefined)
let q: string; // (optional) (default to undefined)
let role: 'ADMIN' | 'VERIFIED_USER'; //Filter users by role (optional) (default to undefined)
let orderBy: 'createdAt' | 'updatedAt' | 'email'; //Field to order results by (optional) (default to 'updatedAt')
let order: 'DESC' | 'ASC'; //Sort order (ascending or descending) (optional) (default to 'DESC')

const { status, data } = await apiInstance.listUsers(
    page,
    perPage,
    q,
    role,
    orderBy,
    order
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to undefined|
| **perPage** | [**number**] |  | (optional) defaults to undefined|
| **q** | [**string**] |  | (optional) defaults to undefined|
| **role** | [**&#39;ADMIN&#39; | &#39;VERIFIED_USER&#39;**]**Array<&#39;ADMIN&#39; &#124; &#39;VERIFIED_USER&#39;>** | Filter users by role | (optional) defaults to undefined|
| **orderBy** | [**&#39;createdAt&#39; | &#39;updatedAt&#39; | &#39;email&#39;**]**Array<&#39;createdAt&#39; &#124; &#39;updatedAt&#39; &#124; &#39;email&#39;>** | Field to order results by | (optional) defaults to 'updatedAt'|
| **order** | [**&#39;DESC&#39; | &#39;ASC&#39;**]**Array<&#39;DESC&#39; &#124; &#39;ASC&#39;>** | Sort order (ascending or descending) | (optional) defaults to 'DESC'|


### Return type

**UserListResponse**

### Authorization

[BearerToken](../README.md#BearerToken)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateUser**
> UserResponse updateUser(updateUserRequest)

Updates a user

### Example

```typescript
import {
    UserApi,
    Configuration,
    UpdateUserRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)
let updateUserRequest: UpdateUserRequest; //Request for updating a User

const { status, data } = await apiInstance.updateUser(
    id,
    updateUserRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserRequest** | **UpdateUserRequest**| Request for updating a User | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**UserResponse**

### Authorization

[BearerToken](../README.md#BearerToken)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**0** | Unexpected error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

