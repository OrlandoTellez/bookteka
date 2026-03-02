import { Spinner } from "./Spinner"
import styles from "./Loading.module.css"

interface LoadingProps {
  text: string;
  subtext?: string;
}

export const Loading = ({ text, subtext }: LoadingProps) => {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          <Spinner />
          <span>{text}</span>
          <span>{subtext}</span>
        </div>
      </div>

    </>
  )
}

