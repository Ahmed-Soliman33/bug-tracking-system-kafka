import { Component } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-background">
          <Card className="max-w-md w-full">
            <CardContent className="py-12 text-center space-y-4">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {this.state.error?.message || "An unexpected error occurred."}
                </p>
              </div>
              <Button
                onClick={() => this.setState({ hasError: false, error: null })}
                variant="outline"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
