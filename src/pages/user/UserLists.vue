<template>
  <div class='page-content'>
    <div slot="top">
      <el-form label-width="90px">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="3">
            <el-input placeholder="用户名" v-model="searchParameter.user_name" @keyup.enter.native="search"></el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="3">
            <el-input placeholder="业务员名" v-model="searchParameter.market_uid" @keyup.enter.native="search"></el-input>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="3">
            <el-input placeholder="手机号" v-model="searchParameter.phone" @keyup.enter.native="search"></el-input>
          </el-col>
          <el-col :xs="12" :sm="12" :lg="5">
            <el-date-picker v-model="searchParameter.start" @change="search" @keydown.enter.capture.native="search" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd" type="date" placeholder="开始日期">
            </el-date-picker>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="1">
            <el-date-picker v-model="searchParameter.end" @change="handleEndDate()" @keydown.enter.capture.native="handleEndDate()" format="yyyy-MM-dd HH:mm:ss" type="date" placeholder="结束日期">
            </el-date-picker>
          </el-col>
        </el-row>

        <el-row :xs="24" :sm="12" :lg="6" style="margin-top: 20px;">
          <el-button type="primary" @click="search" icon="el-icon-search">搜索</el-button>
          <el-button @click="resetForm" icon="el-icon-refresh">重置</el-button>
          <el-button type="success" @click="showDialog('add')" icon="el-icon-plus">新增用户</el-button>

          <span v-if="auth == 1" style="margin-left: 10px;">
            <el-button @click="searchAgent(3)" type="success" plain>真实会员</el-button>
            <el-button @click="searchAgent(1)" type="primary" plain>虚拟用户</el-button>
            <el-button @click="searchAgent(2)" type="warning" plain>试用用户</el-button>
          </span>

          <el-divider direction="vertical"></el-divider>

          <el-button @click="handSearchType($minTool.DATE_CATEGORY.today)" size="small">今日</el-button>
          <el-button @click="handSearchType($minTool.DATE_CATEGORY.yesterday)" size="small">昨日</el-button>
          <el-button @click="handSearchType($minTool.DATE_CATEGORY.week)" size="small">本周</el-button>
          <el-button @click="handSearchType($minTool.DATE_CATEGORY.lastWeek)" size="small">上周</el-button>
          <el-button @click="handSearchType($minTool.DATE_CATEGORY.month)" size="small">本月</el-button>
          <el-button @click="handSearchType($minTool.DATE_CATEGORY.lastMonth)" size="small">上月</el-button>
        </el-row>
      </el-form>
    </div>

    <el-table style="margin-top: 15px;" border :data="roleList" :showPage="false" v-loading="loading">
      <el-table-column label="ID" width="80" prop="id" sortable />

      <!-- 在线状态前移 -->
      <el-table-column label="在线状态" width="120" prop="online">
        <template slot-scope="scope">
          <template v-if="scope.row.online == 0">
            <el-tag type="info" size="small">离线</el-tag>
          </template>
          <template v-else>
            <el-tag type="success" size="small">
              <i class="el-icon-video-camera"></i>
              {{scope.row.online_ip == 'null' ? '在线' : scope.row.online_ip}}
            </el-tag>
          </template>
        </template>
      </el-table-column>

      <el-table-column label="用户名称" width="120" prop="user_name" show-overflow-tooltip />
      <el-table-column label="用户备注" width="100" prop="remarks" show-overflow-tooltip />
      <el-table-column label="上级代理" width="100" prop="agent_nickname" show-overflow-tooltip />

      <el-table-column label="账号类型" width="80" prop="type">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.type == 1 ? 'primary' : ''">
            {{scope.row.type == 1 ? '代理' : '会员'}}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="用户电话" width="120" prop="phone" />

      <el-table-column label="可用余额" width="110" prop="money_balance">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="showMoneyDialog(scope.row,90)">
            ¥{{scope.row.money_balance}}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="洗码金额" width="110" prop="money_freeze">
        <template slot-scope="scope">
          <el-button type="warning" size="mini" @click="showMoneyDialog(scope.row,91)">
            ¥{{scope.row.money_freeze}}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="洗码费余额" width="110" prop="rebate_balance">
        <template slot-scope="scope">
          <el-button type="success" size="mini" @click="showMoneyDialog(scope.row,88)">
            ¥{{scope.row.rebate_balance || 0}}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="洗码率%" width="80" prop="xima_lv" />

      <el-table-column label="状态" width="100" prop="status">
        <template slot-scope="scope">
          <div style="display: flex; align-items: center; flex-direction: column;">
            <el-tag size="mini" :type="scope.row.status ? 'success' : 'danger'">
              {{scope.row.status == 1 ? '正常' : '禁用'}}
            </el-tag>
            <el-switch
              v-model="scope.row.status"
              @change="changes(scope.row.status,scope.row,'status')"
              :active-value="1"
              :inactive-value="0"
              size="mini"
              style="margin-top: 5px;">
            </el-switch>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="160" prop="create_time" sortable />

      <el-table-column fixed="right" label="操作" width="220px">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showDialog('edit',scope.row)">
              编辑
            </el-button>
            <el-button type="success" size="mini" icon="el-icon-bank-card" @click="showWithdrawalAccounts(scope.row)" v-if="scope.row.is_fictitious != 2">
              提现账户
            </el-button>
          </el-button-group>

          <div style="margin-top: 5px;">
            <el-button type="info" size="mini" icon="el-icon-data-line" @click="showRecord(scope.row)">
              统计记录
            </el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteUser(scope.row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 用户编辑弹窗 -->
    <el-dialog :title="dialogTitle" width="600px" :visible.sync="dvEdit" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px" :rules="formRules">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账号" prop="user_name">
              <el-input v-model="form.user_name" placeholder="请输入账号(必填)" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码">
              <el-input v-model="form.pwd" type="password" placeholder="不填默认aa123456" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="提现密码">
              <el-input v-model="form.withdraw_pwd" type="password" placeholder="不填默认123456" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="账号类型">
              <el-radio-group v-model="form.type" size="medium">
                <el-radio key="1" label="1">代理</el-radio>
                <el-radio key="2" label="2">会员</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="业务员ID">
              <el-input v-model="form.market_uid" placeholder="请输入业务员ID(可不填)" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="洗码率%">
              <el-input v-model="form.xima_lv" placeholder="请输入洗码率" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="可用余额￥">
              <el-input v-model="form.money_balance" readonly placeholder="可用余额" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="冻结金额￥">
              <el-input v-model="form.money_freeze" readonly placeholder="冻结余额" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="洗码费余额￥">
              <el-input v-model="form.rebate_balance" readonly placeholder="洗码费余额" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <template v-if="auth == 1">
          <el-form-item label="代理ID" v-if="form.agent_id > 0 && typeEdit == 'edit'">
            <template v-if="typeEdit == 'edit'">
              <span>{{form.agent_id}}</span>
            </template>
          </el-form-item>
          <el-form-item label="代理ID" v-if="typeEdit == 'add'">
            <el-input v-model="form.id_code" placeholder="请输入上级代理ID" @keyup.enter.native="onSubmit"></el-input>
          </el-form-item>
          <el-form-item label="代理昵称" v-if="form.agent_id > 0 && typeEdit == 'edit'">
            <span>{{form.agent_nickname}}</span>
          </el-form-item>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="form.phone" placeholder="请输入手机号(可不填)" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注">
              <el-input v-model="form.remarks" placeholder="请输入备注(可不填)" @keyup.enter.native="onSubmit"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dvEdit = false">取 消</el-button>
        <el-button type="primary" @click="onSubmit" :loading="submitLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 资金记录弹窗 -->
    <el-dialog :title="infotitle" width="70%" :visible.sync="showRechargeVisible" :close-on-click-modal="false">
      <el-table :data="rechargeList" border>
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="用户名称" prop="user_name" width="120" />
        <el-table-column label="业务员" prop="admin_name" width="100" />
        <el-table-column label="详细类型" prop="status" width="120" />
        <el-table-column label="变化前金额" prop="money_before" width="120" />
        <el-table-column label="变化后金额" prop="money_end" width="120" />
        <el-table-column label="变化金额" prop="money" width="120" />
        <el-table-column label="创建时间" prop="create_time" width="160" />
      </el-table>

      <el-pagination
        v-if="allpageRecharge > 10"
        @current-change="handleCurrentChangeRecharge"
        :current-page="currentRecharge"
        :page-size="10"
        layout="total, prev, pager, next, jumper"
        :total="allpageRecharge"
        style="margin-top: 20px; text-align: center;">
      </el-pagination>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showRechargeVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 统计记录弹窗 -->
    <el-dialog title="用户统计记录" width="80%" :visible.sync="showRechargeCount" :close-on-click-modal="false">
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="8">
          <el-date-picker
            v-model="searchGameCountAll.start"
            @change="searchGameCount"
            format="yyyy-MM-dd"
            type="date"
            placeholder="开始日期">
          </el-date-picker>
        </el-col>
        <el-col :span="8">
          <el-date-picker
            v-model="searchGameCountAll.end"
            type="date"
            @change="handleEnd()"
            format="yyyy-MM-dd"
            placeholder="结束日期">
          </el-date-picker>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="searchGameCount" icon="el-icon-search">搜索</el-button>
        </el-col>
      </el-row>

      <el-table :data="game_count_all" border>
        <el-table-column label="游戏类型" prop="game_name" width="120" />
        <el-table-column label="投注总额" prop="bet_amt" width="120" />
        <el-table-column label="输赢合计" prop="win_amt" width="120" />
        <el-table-column label="输金额" prop="transport_bet_amt" width="120" />
        <el-table-column label="赢金额" prop="win_win_amt" width="120" />
        <el-table-column label="总洗码" prop="shuffling_amt" width="120" />
        <el-table-column label="免佣洗码" prop="is_ok_exempt" width="120" />
        <el-table-column label="非免佣洗码" prop="is_no_exempt" width="120" />
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showRechargeCount = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 金额编辑弹窗 -->
    <el-dialog :title="dialogMoneyTitle" width="400px" :visible.sync="moneyDialogVisible" :close-on-click-modal="false">
      <el-form ref="moneyForm" :model="moneyForm" label-width="80px">
        <el-form-item label="变更类型">
          <el-select v-model="money_change_type" style="width:100%" placeholder="请选择">
            <el-option key="1" label="增加" value="1"></el-option>
            <el-option key="2" label="减少" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="变更金额">
          <el-input v-model="change_money" placeholder="请输入变更金额" type="number"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="moneyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onMoneySubmit" :loading="moneySubmitLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 提现账户管理弹窗 -->
    <el-dialog title="提现账户管理" width="80%" :visible.sync="withdrawalAccountVisible" :close-on-click-modal="false">
      <div style="margin-bottom: 20px;">
        <el-button type="primary" @click="showAccountDialog('add')" icon="el-icon-plus">新增账户</el-button>
      </div>

      <el-table :data="withdrawalAccounts" border v-loading="accountLoading">
        <el-table-column label="账户类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getAccountTypeColor(scope.row.account_type)" size="small">
              {{getAccountTypeName(scope.row.account_type)}}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="账户信息" min-width="200">
          <template slot-scope="scope">
            <div class="account-info">
              <div><strong>{{scope.row.account_name}}</strong></div>
              <div v-if="scope.row.account_type === 'aba'">
                账号: {{scope.row.account_number}}
              </div>
              <div v-else-if="scope.row.account_type === 'huiwang'">
                汇旺号: {{scope.row.account_number}}
              </div>
              <div v-else-if="scope.row.account_type === 'usdt'">
                地址: {{formatWalletAddress(scope.row.wallet_address)}}
                <el-tag size="mini" type="success">{{scope.row.network_type}}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="银行/网络" width="140">
          <template slot-scope="scope">
            <span v-if="scope.row.account_type === 'aba'">{{scope.row.bank_branch}}</span>
            <span v-else-if="scope.row.account_type === 'usdt'">{{scope.row.network_type}}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column label="手机号" width="120" prop="phone_number" />

        <el-table-column label="备注名称" width="100" prop="remark_name" />

        <el-table-column label="默认" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.is_default" type="success" size="mini">默认</el-tag>
            <el-switch
              v-else
              v-model="scope.row.is_default"
              @change="setDefaultAccount(scope.row)"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              @change="changeAccountStatus(scope.row)"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="160" prop="created_at" />

        <el-table-column fixed="right" label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" @click="showAccountDialog('edit', scope.row)" icon="el-icon-edit">编辑</el-button>
            <el-button type="text" style="color: #f56c6c" @click="deleteAccount(scope.row)" icon="el-icon-delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="withdrawalAccountVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 账户编辑弹窗 -->
    <el-dialog :title="accountDialogTitle" width="600px" :visible.sync="accountDialogVisible" :close-on-click-modal="false">
      <el-form ref="accountForm" :model="accountForm" label-width="100px" :rules="accountRules">
        <el-form-item label="账户类型" prop="account_type">
          <el-radio-group v-model="accountForm.account_type" @change="onAccountTypeChange">
            <el-radio label="aba">ABA银行</el-radio>
            <el-radio label="huiwang">汇旺</el-radio>
            <el-radio label="usdt">USDT钱包</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="账户姓名" prop="account_name">
          <el-input v-model="accountForm.account_name" placeholder="请输入账户姓名"></el-input>
        </el-form-item>

        <!-- ABA银行和汇旺账号 -->
        <el-form-item
          v-if="accountForm.account_type === 'aba' || accountForm.account_type === 'huiwang'"
          :label="accountForm.account_type === 'aba' ? '银行卡号' : '汇旺账号'"
          prop="account_number">
          <el-input v-model="accountForm.account_number" :placeholder="accountForm.account_type === 'aba' ? '请输入银行卡号' : '请输入汇旺账号'"></el-input>
        </el-form-item>

        <!-- 开户行 - 仅ABA银行 -->
        <el-form-item v-if="accountForm.account_type === 'aba'" label="开户行" prop="bank_branch">
          <el-input v-model="accountForm.bank_branch" placeholder="请输入开户行"></el-input>
        </el-form-item>

        <!-- USDT钱包地址 -->
        <el-form-item v-if="accountForm.account_type === 'usdt'" label="钱包地址" prop="wallet_address">
          <el-input v-model="accountForm.wallet_address" placeholder="请输入USDT钱包地址" type="textarea" :rows="3"></el-input>
        </el-form-item>

        <!-- 网络类型 - 仅USDT -->
        <el-form-item v-if="accountForm.account_type === 'usdt'" label="网络类型" prop="network_type">
          <el-radio-group v-model="accountForm.network_type">
            <el-radio label="TRC20">TRC20(波场)</el-radio>
            <el-radio label="ERC20">ERC20(以太坊)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="accountForm.phone_number" placeholder="请输入手机号"></el-input>
        </el-form-item>

        <el-form-item label="身份证号">
          <el-input v-model="accountForm.id_number" placeholder="请输入身份证号"></el-input>
        </el-form-item>

        <el-form-item label="备注名称">
          <el-input v-model="accountForm.remark_name" placeholder="请输入备注名称"></el-input>
        </el-form-item>

        <el-form-item label="设为默认">
          <el-switch v-model="accountForm.is_default" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="accountDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAccount" :loading="accountSubmitLoading">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分页 -->
    <el-pagination
      v-if="allpage > 10"
      @current-change="handleCurrentChange"
      :current-page="current"
      :page-size="10"
      layout="total, prev, pager, next, jumper"
      :total="allpage"
      style="margin-top: 20px; text-align: center;">
    </el-pagination>
  </div>
</template>

<script>
  import {
    getUserStatusApi,
    getIsStatusApi,
    getUserListApi,
    getUserDelApi,
    getUserEditApi,
    getUserAddApi,
    getMoneyEditApi,
    // 移除限红相关API
    // getXianHongApi,
    // getUserBankApi,
    // getBankEditApi
  } from '@/api/userApi'

  // 新增提现账户相关API (需要实际实现)
  import {
    getWithdrawalAccountsApi,
    addWithdrawalAccountApi,
    updateWithdrawalAccountApi,
    deleteWithdrawalAccountApi,
    setDefaultWithdrawalAccountApi,
    changeWithdrawalAccountStatusApi
  } from '@/api/withdrawalAccountApi'

  import {
    getMoneyListApi,
    getWinOrLoseApi
  } from '@/api/MoneylogApi'
  import {
    adminTypeAuth
  } from "@/utils/auth"
  import moment from "moment"

  export default {
    data() {
      return {
        loading: false,
        submitLoading: false,
        moneySubmitLoading: false,
        accountLoading: false,
        accountSubmitLoading: false,

        allpage: 1,
        current: 1,
        dvEdit: false,
        showRechargeCount: false,
        withdrawalAccountVisible: false,
        accountDialogVisible: false,

        searchGameCountAll: {
          id: 0,
          start: '',
          end: ''
        },

        dialogTitle: '',
        infotitle: '',
        accountDialogTitle: '',

        form: {
          user_name: '',
          pwd: '',
          withdraw_pwd: '',
          type: '2',
          market_uid: '',
          xima_lv: '',
          money_balance: 0,
          money_freeze: 0,
          rebate_balance: 0,
          phone: '',
          remarks: ''
        },

        // 提现账户表单
        accountForm: {
          user_id: 0,
          account_type: 'aba',
          account_name: '',
          account_number: '',
          phone_number: '',
          bank_branch: '',
          id_number: '',
          wallet_address: '',
          network_type: 'TRC20',
          remark_name: '',
          is_default: 0,
          status: 1
        },

        searchParameter: {
          user_name: undefined,
          market_uid: undefined,
          phone: undefined,
          start: '',
          end: '',
          type: 2,
          is_fictitious: 3,
          page: 1
        },

        auth: 1,
        roleList: [],
        withdrawalAccounts: [],
        game_count_all: [],
        showRechargeVisible: false,
        rechargeList: [],
        currentRecharge: 1,
        allpageRecharge: 1,
        uid: '',
        status: 101,
        money_ststus: 90,
        moneyDialogVisible: false,
        dialogMoneyTitle: '编辑可用余额',
        moneyForm: {},
        money_change_type: '',
        change_money: '',
        typeEdit: 'add',

        // 表单验证规则
        formRules: {
          user_name: [
            { required: true, message: '请输入用户名', trigger: 'blur' }
          ]
        },

        accountRules: {
          account_type: [
            { required: true, message: '请选择账户类型', trigger: 'change' }
          ],
          account_name: [
            { required: true, message: '请输入账户姓名', trigger: 'blur' }
          ],
          account_number: [
            { required: true, message: '请输入账号', trigger: 'blur' }
          ],
          wallet_address: [
            { required: true, message: '请输入钱包地址', trigger: 'blur' }
          ],
          network_type: [
            { required: true, message: '请选择网络类型', trigger: 'change' }
          ]
        }
      };
    },

    created() {
      let dateType = this.$route.query.dateType ? this.$route.query.dateType : ''
      if (dateType == 'today') {
        this.searchParameter.start = this.$minTool.handleDateType[dateType].start
        this.searchParameter.end = this.$minTool.handleDateType[dateType].end
      }
    },

    mounted() {
      this.getUserList()
      this.auth = adminTypeAuth();
    },

    methods: {
      // 状态变更
      changes(status, row, type) {
        if (type == 'status') {
          getUserStatusApi({
            id: row.id,
            status: status,
          }).then(res => {
            this.$message({
              message: res.msg,
              type: 'success'
            });
          })
          return;
        }
        getIsStatusApi({
          id: row.id,
        }).then(res => {})
      },

      // 处理结束日期
      handleEndDate() {
        this.searchParameter.end = moment(this.searchParameter.end).format('YYYY-MM-DD') + ' 23:59:59'
        this.search()
      },

      // 处理统计结束日期
      handleEnd() {
        this.searchGameCountAll.end = moment(this.searchGameCountAll.end).format('YYYY-MM-DD') + ' 23:59:59'
        this.searchGameCount()
      },

      // 设置时间范围
      handSearchType(dateType) {
        this.searchParameter.start = this.$minTool.handleDateType[dateType].start
        this.searchParameter.end = this.$minTool.handleDateType[dateType].end
        this.getUserList()
      },

      // 显示金额编辑弹窗
      showMoneyDialog: function(row, type) {
        this.moneyForm = row;
        this.money_change_type = '';
        this.change_money = '';
        this.money_ststus = type;
        if (type == 90) {
          this.dialogMoneyTitle = '编辑可用余额';
        } else if (type == 91) {
          this.dialogMoneyTitle = '编辑冻结余额';
        } else if (type == 88) {
          this.dialogMoneyTitle = '编辑洗码费余额';
        }
        this.moneyDialogVisible = true;
      },

      // 提交金额变更
      onMoneySubmit: function() {
        if (!this.money_change_type) {
          this.$message.error('请选择变更类型');
          return;
        }
        if (!this.change_money) {
          this.$message.error('请输入变更金额');
          return;
        }

        this.moneySubmitLoading = true;
        getMoneyEditApi({
          money_change_type: this.money_change_type,
          uid: this.moneyForm.id,
          change_money: this.change_money,
          money_ststus: this.money_ststus
        }).then(res => {
          if (res.code === 1) {
            this.moneyDialogVisible = false;
            this.$message({
              message: '操作成功',
              type: 'success'
            });
            this.handleCurrentChange(this.current);
          }
        }).finally(() => {
          this.moneySubmitLoading = false;
        })
      },

      // 显示资金记录
      showRechargeList: function(row, status) {
        this.currentRecharge = 1;
        this.uid = row.id;
        this.status = status;
        getMoneyListApi({
          page: this.currentRecharge,
          uid: row.id,
          status: this.status
        }).then(res => {
          this.rechargeList = res.data.data;
          this.allpageRecharge = res.data.total;
          this.infotitle = status === 101 ? '充值详情' : '提现详情';
          this.showRechargeVisible = true;
        })
      },

      // 重置搜索表单
      resetForm() {
        this.searchParameter = {
          user_name: undefined,
          market_uid: undefined,
          phone: undefined,
          start: '',
          end: '',
          type: 2,
          is_fictitious: 3,
          page: 1
        }
        this.getUserList()
      },

      // 资金记录分页
      handleCurrentChangeRecharge: function(index) {
        this.currentRecharge = index;
        getMoneyListApi({
          page: index,
          uid: this.uid,
          status: this.status
        }).then(res => {
          this.rechargeList = res.data.data;
          this.allpageRecharge = res.data.total;
        })
      },

      // 用户列表分页
      handleCurrentChange: function(index) {
        this.current = index;
        this.searchParameter.page = index;
        this.getUserList()
      },

      // 获取用户列表
      getUserList() {
        this.loading = true;
        getUserListApi(this.searchParameter).then(res => {
          this.roleList = res.data.data
          this.allpage = res.data.total;
        }).finally(() => {
          this.loading = false;
        })
      },

      // 显示统计记录
      showRecord(e) {
        this.showRechargeCount = true;
        this.searchGameCountAll = [];
        this.searchGameCountAll.id = e.id;

        getWinOrLoseApi({id: e.id}).then(res => {
          this.game_count_all = res.data;
        })
      },

      // 搜索游戏统计
      searchGameCount() {
        getWinOrLoseApi(this.searchGameCountAll).then(res => {
          this.game_count_all = res.data;
        })
      },

      // 搜索
      search() {
        this.searchParameter.page = 1;
        this.current = 1;
        this.getUserList()
      },

      // 按代理类型搜索
      searchAgent(type) {
        this.searchParameter.is_fictitious = type;
        this.getUserList()
      },

      // 显示用户编辑弹窗
      showDialog(type, row) {
        this.typeEdit = type;
        this.dvEdit = true;
        if (type == 'edit') {
          this.form = { ...row };
          this.form.type = row.type.toString();
        } else {
          let nickname = '新用户' + Math.round(Math.random() * 100000);
          this.form = {
            'type': '2',
            'nickname': nickname,
            'money_balance': 0,
            'money_freeze': 0,
            'rebate_balance': 0,
            'xima_lv': 0,
            'user_name': '',
            'pwd': '',
            'withdraw_pwd': '',
            'market_uid': '',
            'phone': '',
            'remarks': ''
          };
        }
        this.dialogTitle = type === 'add' ? '新增用户' : '编辑用户'
      },

      // 提交用户表单
      onSubmit() {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.submitLoading = true;

            if (this.form.id) {
              getUserEditApi(this.form).then(res => {
                if (res.code == 1) {
                  this.dvEdit = false
                  this.$message({
                    message: '编辑成功',
                    type: 'success'
                  });
                  this.handleCurrentChange(this.current);
                }
              }).finally(() => {
                this.submitLoading = false;
              })
            } else {
              getUserAddApi(this.form).then(res => {
                if (res.code == 1) {
                  this.dvEdit = false
                  this.$message({
                    message: '新增成功',
                    type: 'success'
                  });
                  this.getUserList();
                }
              }).finally(() => {
                this.submitLoading = false;
              })
            }
          }
        });
      },

      // 删除用户
      deleteUser(scope) {
        this.$confirm('您确定要删除当前用户吗？删除后无法恢复！', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }).then(() => {
          getUserDelApi({
            'id': scope.id
          }).then(res => {
            if (res.code == 1) {
              this.$message({
                message: '删除成功',
                type: 'success'
              });
              this.getUserList();
            }
          })
        }).catch(() => {})
      },

      // ========== 提现账户管理相关方法 ==========

      // 显示提现账户管理
      showWithdrawalAccounts(row) {
        this.accountLoading = true;
        this.withdrawalAccountVisible = true;

        // 获取用户的提现账户列表
        getWithdrawalAccountsApi({user_id: row.id}).then(res => {
          if (res.code === 1) {
            this.withdrawalAccounts = res.data || [];
          }
        }).finally(() => {
          this.accountLoading = false;
        })

        // 保存当前用户ID
        this.currentUserId = row.id;
      },

      // 显示账户编辑弹窗
      showAccountDialog(type, row) {
        this.accountDialogVisible = true;
        this.accountDialogTitle = type === 'add' ? '新增提现账户' : '编辑提现账户';

        if (type === 'edit') {
          this.accountForm = { ...row };
        } else {
          this.accountForm = {
            user_id: this.currentUserId,
            account_type: 'aba',
            account_name: '',
            account_number: '',
            phone_number: '',
            bank_branch: '',
            id_number: '',
            wallet_address: '',
            network_type: 'TRC20',
            remark_name: '',
            is_default: 0,
            status: 1
          };
        }
      },

      // 账户类型变更
      onAccountTypeChange() {
        // 清除不相关的字段
        if (this.accountForm.account_type === 'usdt') {
          this.accountForm.account_number = '';
          this.accountForm.bank_branch = '';
        } else {
          this.accountForm.wallet_address = '';
          this.accountForm.network_type = 'TRC20';
        }
      },

      // 提交账户表单
      submitAccount() {
        this.$refs.accountForm.validate((valid) => {
          if (valid) {
            this.accountSubmitLoading = true;

            const api = this.accountForm.id ? updateWithdrawalAccountApi : addWithdrawalAccountApi;

            api(this.accountForm).then(res => {
              if (res.code === 1) {
                this.accountDialogVisible = false;
                this.$message({
                  message: this.accountForm.id ? '编辑成功' : '新增成功',
                  type: 'success'
                });
                this.showWithdrawalAccounts({id: this.currentUserId});
              }
            }).finally(() => {
              this.accountSubmitLoading = false;
            })
          }
        });
      },

      // 删除账户
      deleteAccount(row) {
        this.$confirm('确定要删除这个提现账户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteWithdrawalAccountApi({id: row.id}).then(res => {
            if (res.code === 1) {
              this.$message({
                message: '删除成功',
                type: 'success'
              });
              this.showWithdrawalAccounts({id: this.currentUserId});
            }
          })
        });
      },

      // 设置默认账户
      setDefaultAccount(row) {
        setDefaultWithdrawalAccountApi({
          user_id: this.currentUserId,
          account_id: row.id
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              message: '设置成功',
              type: 'success'
            });
            this.showWithdrawalAccounts({id: this.currentUserId});
          }
        })
      },

      // 改变账户状态
      changeAccountStatus(row) {
        changeWithdrawalAccountStatusApi({
          id: row.id,
          status: row.status
        }).then(res => {
          if (res.code === 1) {
            this.$message({
              message: '状态更新成功',
              type: 'success'
            });
          }
        })
      },

      // 获取账户类型名称
      getAccountTypeName(type) {
        const names = {
          'aba': 'ABA银行',
          'huiwang': '汇旺',
          'usdt': 'USDT钱包'
        };
        return names[type] || type;
      },

      // 获取账户类型颜色
      getAccountTypeColor(type) {
        const colors = {
          'aba': 'primary',
          'huiwang': 'success',
          'usdt': 'warning'
        };
        return colors[type] || '';
      },

      // 格式化钱包地址
      formatWalletAddress(address) {
        if (!address) return '';
        if (address.length <= 16) return address;
        return address.substr(0, 8) + '...' + address.substr(-8);
      }
    }
  }
</script>

<style lang='scss' scoped>
  .page-content {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    padding: 20px;
  }

  .account-info {
    line-height: 1.6;

    div {
      margin-bottom: 4px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .el-table {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .el-dialog {
    border-radius: 8px;
  }

  .el-button-group {
    .el-button {
      margin-right: 0;
    }
  }

  .el-pagination {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .dialog-footer {
    text-align: right;
  }
</style>
