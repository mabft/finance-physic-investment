import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import type { Holding, Instrument } from '@/types';
import { Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';

export function Holdings() {
  const { holdings, instruments, loadHoldings, loadInstruments, addHolding, editHolding, deleteHolding, isLoading } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [newHolding, setNewHolding] = useState<Holding>({
    code: '',
    name: '',
    cost_price: 0,
    quantity: 0,
    is_dca: false,
  });
  const [editHoldingData, setEditHoldingData] = useState<Holding | null>(null);

  useEffect(() => {
    loadHoldings();
    loadInstruments();
  }, []);

  const filteredInstruments: Instrument[] = [];
  Object.values(instruments).forEach((category) => {
    category.forEach((inst) => {
      if (
        (!searchKeyword || 
         inst.code.toLowerCase().includes(searchKeyword.toLowerCase()) || 
         inst.name.toLowerCase().includes(searchKeyword.toLowerCase()))
      ) {
        filteredInstruments.push(inst);
      }
    });
  });

  const handleSelectInstrument = (inst: Instrument) => {
    setNewHolding({
      ...newHolding,
      code: inst.code,
      name: inst.name,
    });
  };

  const handleAddHolding = async () => {
    if (!newHolding.code || !newHolding.name) return;
    await addHolding(newHolding);
    setShowAddModal(false);
    setNewHolding({ code: '', name: '', cost_price: 0, quantity: 0, is_dca: false });
    setSearchKeyword('');
  };

  const handleEditHolding = async () => {
    if (!editHoldingData) return;
    await editHolding(editHoldingData.code, editHoldingData);
    setShowEditModal(false);
    setEditHoldingData(null);
  };

  const handleDeleteHolding = async (code: string) => {
    if (confirm('确定要删除这个标的吗？')) {
      await deleteHolding(code);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">持仓配置</h2>
          <p className="text-gray-500 dark:text-gray-400">管理您的持仓标的和定投设置</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加标的</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">持仓列表</h3>
            <span className="text-sm text-gray-500">共 {holdings.length} 个标的</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : holdings.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无持仓标的，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">代码</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">名称</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">成本价</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">持仓数量</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">定投</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">操作</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.code} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-mono text-gray-900 dark:text-white">{holding.code}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{holding.name}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">¥{holding.cost_price.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{holding.quantity}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        holding.is_dca ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {holding.is_dca ? '是' : '否'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditHoldingData(holding);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHolding(holding.code)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">添加持仓标的</h3>
              <button onClick={() => {
                setShowAddModal(false);
                setSearchKeyword('');
                setNewHolding({ code: '', name: '', cost_price: 0, quantity: 0, is_dca: false });
              }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">搜索标的</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="输入代码或名称搜索..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                  />
                </div>
                {filteredInstruments.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    {filteredInstruments.slice(0, 10).map((inst) => (
                      <div
                        key={inst.code}
                        onClick={() => handleSelectInstrument(inst)}
                        className={`p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          newHolding.code === inst.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">{inst.name}</span>
                          <span className="text-sm text-gray-500">{inst.code}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标的代码</label>
                <input
                  type="text"
                  value={newHolding.code}
                  onChange={(e) => setNewHolding({ ...newHolding, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标的名称</label>
                <input
                  type="text"
                  value={newHolding.name}
                  onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">成本价</label>
                  <input
                    type="number"
                    value={newHolding.cost_price}
                    onChange={(e) => setNewHolding({ ...newHolding, cost_price: parseFloat(e.target.value) || 0 })}
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">持仓数量</label>
                  <input
                    type="number"
                    value={newHolding.quantity}
                    onChange={(e) => setNewHolding({ ...newHolding, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_dca"
                  checked={newHolding.is_dca}
                  onChange={(e) => setNewHolding({ ...newHolding, is_dca: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="is_dca" className="text-sm font-medium text-gray-700 dark:text-gray-300">开启定投</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchKeyword('');
                  setNewHolding({ code: '', name: '', cost_price: 0, quantity: 0, is_dca: false });
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddHolding}
                disabled={!newHolding.code || !newHolding.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>保存</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editHoldingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">编辑持仓标的</h3>
              <button onClick={() => {
                setShowEditModal(false);
                setEditHoldingData(null);
              }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标的代码</label>
                <input
                  type="text"
                  value={editHoldingData.code}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标的名称</label>
                <input
                  type="text"
                  value={editHoldingData.name}
                  onChange={(e) => setEditHoldingData({ ...editHoldingData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">成本价</label>
                  <input
                    type="number"
                    value={editHoldingData.cost_price}
                    onChange={(e) => setEditHoldingData({ ...editHoldingData, cost_price: parseFloat(e.target.value) || 0 })}
                    step="0.0001"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">持仓数量</label>
                  <input
                    type="number"
                    value={editHoldingData.quantity}
                    onChange={(e) => setEditHoldingData({ ...editHoldingData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_is_dca"
                  checked={editHoldingData.is_dca}
                  onChange={(e) => setEditHoldingData({ ...editHoldingData, is_dca: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="edit_is_dca" className="text-sm font-medium text-gray-700 dark:text-gray-300">开启定投</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditHoldingData(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEditHolding}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>保存</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}