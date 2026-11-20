// Dev-only: renders every @qlastakit/ui component. Loaded only when import.meta.env.DEV
// is true (see routes/dev.components.tsx), so it is not in the production build.
// When a component is added to the UI package, add it here.
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  FieldDescription,
  FieldLabel,
  IconTile,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SettingRow,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Skeleton,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@qlastakit/ui";
import type { ReactNode } from "react";

function Section({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section data-preview={name} className="space-y-3">
      <h2 className="text-lg font-semibold">{name}</h2>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}

export default function ComponentPreview() {
  return (
    <TooltipProvider>
      <div className="mx-auto max-w-4xl space-y-10">
        <Section name="Alert">
          <Alert className="w-full">
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>Default alert.</AlertDescription>
          </Alert>
          <Alert variant="destructive" className="w-full">
            <AlertTitle>Failed</AlertTitle>
            <AlertDescription>Destructive alert.</AlertDescription>
          </Alert>
          <Alert variant="success" className="w-full">
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>Success alert.</AlertDescription>
          </Alert>
        </Section>

        <Section name="Avatar">
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <AvatarGroup>
            <Avatar>
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>EF</AvatarFallback>
            </Avatar>
          </AvatarGroup>
        </Section>

        <Section name="Badge">
          {(
            ["default", "secondary", "success", "warning", "outline", "ghost", "link"] as const
          ).map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </Section>

        <Section name="Button">
          {(
            ["default", "secondary", "outline", "tertiary", "ghost", "destructive", "link"] as const
          ).map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
          {(["xs", "sm", "lg"] as const).map((s) => (
            <Button key={s} size={s}>
              {s}
            </Button>
          ))}
          <Button disabled>disabled</Button>
        </Section>

        <Section name="Card">
          <Card className="w-72">
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>Card description</CardDescription>
            </CardHeader>
            <CardContent>Content</CardContent>
            <CardFooter>Footer</CardFooter>
          </Card>
        </Section>

        <Section name="Checkbox">
          <Checkbox defaultChecked aria-label="checked" />
          <Checkbox aria-label="unchecked" />
        </Section>

        <Section name="Collapsible">
          <Collapsible>
            <CollapsibleTrigger render={<Button variant="outline" />}>Toggle</CollapsibleTrigger>
            <CollapsibleContent>Hidden content</CollapsibleContent>
          </Collapsible>
        </Section>

        <Section name="DropdownMenu">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Open menu
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section name="Field">
          <Field className="w-72">
            <FieldLabel htmlFor="preview-email">Email</FieldLabel>
            <Input id="preview-email" placeholder="you@example.com" />
            <FieldDescription>We never share it.</FieldDescription>
          </Field>
        </Section>

        <Section name="IconTile">
          <IconTile>A</IconTile>
          <IconTile shape="round">B</IconTile>
        </Section>

        <Section name="Input">
          <Input className="w-72" placeholder="Input" />
          <Input className="w-72" placeholder="Disabled" disabled />
        </Section>

        <Section name="InputGroup">
          <InputGroup className="w-72">
            <InputGroupAddon>@</InputGroupAddon>
            <InputGroupInput placeholder="username" />
          </InputGroup>
        </Section>

        <Section name="Label">
          <Label>Label</Label>
        </Section>

        <Section name="Pagination">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Section>

        <Section name="RadioGroup">
          <RadioGroup defaultValue="a">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="a" id="preview-ra" />
              <Label htmlFor="preview-ra">A</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="b" id="preview-rb" />
              <Label htmlFor="preview-rb">B</Label>
            </div>
          </RadioGroup>
        </Section>

        <Section name="Select">
          <Select defaultValue="one">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one">One</SelectItem>
              <SelectItem value="two">Two</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        <Section name="Separator">
          <Separator className="w-full" />
        </Section>

        <Section name="SettingRow">
          <SettingRow
            className="w-full"
            title="Notifications"
            description="Email me about activity"
          >
            <Switch />
          </SettingRow>
        </Section>

        <Section name="Sheet">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sheet</SheetTitle>
                <SheetDescription>Sheet description</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </Section>

        <Section name="Sidebar">
          <div className="relative h-64 w-full overflow-hidden rounded-md border border-border [--sidebar-width:12rem]">
            <SidebarProvider className="min-h-0 h-full">
              <Sidebar collapsible="none">
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton isActive>Home</SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton>Notes</SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>
            </SidebarProvider>
          </div>
        </Section>

        <Section name="Skeleton">
          <Skeleton className="h-6 w-48" />
        </Section>

        <Section name="Spinner">
          <Spinner />
        </Section>

        <Section name="Switch">
          <Switch defaultChecked aria-label="on" />
          <Switch aria-label="off" />
        </Section>

        <Section name="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Ada</TableCell>
                <TableCell>Owner</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section name="Tabs">
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">Tab A</TabsTrigger>
              <TabsTrigger value="b">Tab B</TabsTrigger>
            </TabsList>
            <TabsContent value="a">Panel A</TabsContent>
            <TabsContent value="b">Panel B</TabsContent>
          </Tabs>
        </Section>

        <Section name="Textarea">
          <Textarea className="w-72" placeholder="Textarea" />
        </Section>

        <Section name="Tooltip">
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
            <TooltipContent>Tooltip</TooltipContent>
          </Tooltip>
        </Section>
      </div>
    </TooltipProvider>
  );
}
