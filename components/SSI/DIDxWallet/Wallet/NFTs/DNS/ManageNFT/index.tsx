import React, { useEffect, useState } from 'react'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $resolvedInfo } from '../../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import useRouterHook from '../../../../../../../src/hooks/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import ThreeDots from '../../../../../../Spinner/ThreeDots'
import { useStore } from 'react-stores'

function Component() {
    const { t } = useTranslation()
    const { navigate } = useRouterHook()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''
    const resolvedSubdomain =
        resolvedInfo?.user_subdomain! && resolvedInfo.user_subdomain
            ? resolvedInfo.user_subdomain
            : ''
    const subdomainNavigate =
        resolvedSubdomain !== '' ? resolvedSubdomain + '@' : ''
    const resolvedTLD =
        resolvedInfo?.user_tld! && resolvedInfo.user_tld
            ? resolvedInfo.user_tld
            : ''

    const [loadingCard1, setLoadingCard1] = useState(false)
    const [loadingCard2, setLoadingCard2] = useState(false)

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            <h2>
                <div
                    onClick={() => {
                        setLoadingCard1(true)
                        navigate(
                            `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft/dns/manage/did`
                        )
                        setTimeout(() => {
                            setLoadingCard1(false)
                        }, 1000)
                    }}
                    className={styles.flipCard}
                >
                    <div className={styles.flipCardInner}>
                        <div className={styles.flipCardFront}>
                            <div className={styles.cardTitle3}>
                                {loadingCard1 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    t('UPDATE NFT DID')
                                )}
                            </div>
                        </div>
                        <div className={styles.flipCardBack}>
                            <div className={styles.cardTitle2}>
                                {loadingCard1 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    t(
                                        'CHANGE THE DID ASSOCIATED WITH YOUR USERNAME'
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </h2>
            <h2>
                <div
                    onClick={() => {
                        setLoadingCard2(true)
                        navigate(
                            `/${subdomainNavigate}${resolvedDomain}/didx/wallet/nft/dns/manage/transfer`
                        )
                        setTimeout(() => {
                            setLoadingCard2(false)
                        }, 1000)
                    }}
                    className={styles.flipCard}
                >
                    <div className={styles.flipCardInner}>
                        <div className={styles.flipCardFront}>
                            <div className={styles.cardTitle3}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    t('TRANSFER NFT USERNAME')
                                )}
                            </div>
                        </div>
                        <div className={styles.flipCardBack}>
                            <div className={styles.cardTitle2}>
                                {loadingCard2 ? (
                                    <ThreeDots color="yellow" />
                                ) : (
                                    t(
                                        'MODIFY THE ADDRESS ASSOCIATED WITH YOUR USERNAME'
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </h2>
        </div>
    )
}

export default Component
