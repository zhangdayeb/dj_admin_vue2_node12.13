import axios from '@/utils/request';

// 获取用户提现账户列表
export function getWithdrawalAccountsApi(data) {
  return axios.post({
    url: '/withdrawal_accounts/list',
    data: data,
  }).then((res) => {
    return res
  })
}

// 新增提现账户
export function addWithdrawalAccountApi(data) {
  return axios.post({
    url: '/withdrawal_accounts/add',
    data: data,
  }).then((res) => {
    return res
  })
}

// 编辑提现账户
export function updateWithdrawalAccountApi(data) {
  return axios.post({
    url: '/withdrawal_accounts/edit',
    data: data,
  }).then((res) => {
    return res
  })
}

// 删除提现账户
export function deleteWithdrawalAccountApi(data) {
  return axios.post({
    url: '/withdrawal_accounts/del',
    data: data,
  }).then((res) => {
    return res
  })
}

// 设置默认账户
export function setDefaultWithdrawalAccountApi(data) {
  return axios.post({
    url: '/withdrawal_accounts/set_default',
    data: data,
  }).then((res) => {
    return res
  })
}

// 更改账户状态
export function changeWithdrawalAccountStatusApi(data) {
  return axios.post({
    url: '/withdrawal_accounts/status',
    data: data,
  }).then((res) => {
    return res
  })
}
