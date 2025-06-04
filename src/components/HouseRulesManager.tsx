
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Home } from 'lucide-react';
import { useHouseholdInfo } from '@/hooks/useHouseholdInfo';

interface HouseRulesManagerProps {
  householdId: string;
  canEdit: boolean;
}

const HouseRulesManager: React.FC<HouseRulesManagerProps> = ({ householdId, canEdit }) => {
  const { householdInfo, addHouseholdInfo, deleteHouseholdInfo } = useHouseholdInfo(householdId);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState('');

  const houseRules = householdInfo.filter(info => info.info_type === 'house_rule');
  const emergencyNumbers = householdInfo.filter(info => info.info_type === 'emergency_number');

  const handleAddRule = async () => {
    if (newRule.trim()) {
      await addHouseholdInfo({
        household_id: householdId,
        title: 'House Rule',
        value: newRule,
        description: 'Family house rule',
        info_type: 'house_rule'
      });
      setNewRule('');
      setShowAddRule(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-orange-500" />
            House Rules & Quick Reference
          </CardTitle>
          {canEdit && (
            <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add House Rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rule">Rule</Label>
                    <Input
                      id="rule"
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      placeholder="e.g., Wash hands before meals"
                    />
                  </div>
                  <Button onClick={handleAddRule} className="w-full">
                    Add Rule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">House Rules</h4>
            {houseRules.length === 0 ? (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div>• Wash hands before meals</div>
                <div>• Clean up toys before getting new ones</div>
                <div>• Ask permission before going outside</div>
                <div>• Use indoor voices</div>
                {canEdit && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Add custom rules above to replace these defaults
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {houseRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">• {rule.value}</span>
                    {canEdit && (
                      <Button
                        onClick={() => deleteHouseholdInfo(rule.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Emergency Numbers</h4>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div>911 - Emergency</div>
              <div>Poison Control: 1-800-222-1222</div>
              <div>Non-Emergency Police: 311</div>
              {emergencyNumbers.map((number) => (
                <div key={number.id} className="flex items-center justify-between">
                  <span>{number.title}: {number.value}</span>
                  {canEdit && (
                    <Button
                      onClick={() => deleteHouseholdInfo(number.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseRulesManager;
