import { useEffect, useRef } from "react"
// @ts-expect-error -- @rails/actioncable has no type declarations
import { createConsumer } from "@rails/actioncable"

const consumer = createConsumer()

export function useChannel<T>(
  channelName: string,
  params: Record<string, unknown>,
  onReceived: (data: T) => void,
) {
  const callbackRef = useRef(onReceived)
  callbackRef.current = onReceived

  useEffect(() => {
    const subscription = consumer.subscriptions.create(
      { channel: channelName, ...params },
      {
        received(data: T) {
          callbackRef.current(data)
        },
      },
    )

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params identity changes each render, use JSON key
  }, [channelName, JSON.stringify(params)])
}
