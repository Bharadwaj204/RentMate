import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_BALANCES, MOCK_SETTLEMENT_SUGGESTIONS, getCurrentUser } from "@/lib/placeholder-data";
import { cn } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, Handshake, Users, BarChartBig } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const currentUser = getCurrentUser();

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-8">Welcome, {currentUser.name.split(' ')[0]}!</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Net Balance</CardTitle>
            <BarChartBig className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {MOCK_BALANCES.filter(b => b.memberId === currentUser.id).map(balance => (
              <div key={balance.memberId} className={cn(
                "text-2xl font-bold",
                balance.amount >= 0 ? "text-accent-foreground" : "text-destructive"
              )}>
                {balance.amount >= 0 ? `You are owed $${balance.amount.toFixed(2)}` : `You owe $${Math.abs(balance.amount).toFixed(2)}`}
              </div>
            ))}
             <p className="text-xs text-muted-foreground">
              Overall household balance status
            </p>
          </CardContent>
        </Card>
         <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed to You</CardTitle>
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">$20.50</div>
            <p className="text-xs text-muted-foreground">
              From 1 transaction
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total You Owe</CardTitle>
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">$30.25</div>
             <p className="text-xs text-muted-foreground">
              Across 2 transactions
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Member Balances</CardTitle>
            <CardDescription>Overview of who owes what to whom in the household.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {MOCK_BALANCES.map((balance) => (
                <li key={balance.memberId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={DEFAULT_AVATAR + `?text=${balance.memberName.split(' ').map(n=>n[0]).join('')}`} alt={balance.memberName} />
                      <AvatarFallback>{balance.memberName.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{balance.memberName}</span>
                  </div>
                  <Badge variant={balance.amount >= 0 ? "default" : "destructive"} className={cn(balance.amount >=0 ? "bg-accent text-accent-foreground" : "")}>
                    {balance.amount >= 0 ? `Owed $${balance.amount.toFixed(2)}` : `Owes $${Math.abs(balance.amount).toFixed(2)}`}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Handshake className="text-accent"/> Settle Up Suggestions</CardTitle>
            <CardDescription>Minimize transactions with these suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            {MOCK_SETTLEMENT_SUGGESTIONS.length > 0 ? (
              <ul className="space-y-3">
                {MOCK_SETTLEMENT_SUGGESTIONS.map((suggestion, index) => (
                  <li key={index} className="p-3 border rounded-lg shadow-sm">
                    <p className="text-sm">
                      <span className="font-semibold text-destructive">{suggestion.fromMemberName}</span> should pay <span className="font-semibold text-accent-foreground">{suggestion.toMemberName}</span>
                      <span className="font-bold text-primary"> ${suggestion.amount.toFixed(2)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">All balances are settled!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
