import * as tyron from 'tyron'
import React, { useEffect } from 'react'
import { useStore as effectorStore } from 'effector-react'
import { $doc } from '../../../../src/store/did-doc'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $loading, $loadingDoc } from '../../../../src/store/loading'
import useFetch from '../../../../src/hooks/fetch'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import { toast } from 'react-toastify'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import { Spinner } from '../../..'
import toastTheme from '../../../../src/hooks/toastTheme'
import useRouterHook from '../../../../src/hooks/router'
import useArConnect from '../../../../src/hooks/useArConnect'
import { $arconnect } from '../../../../src/store/arconnect'
import { $net } from '../../../../src/store/network'
import { useStore } from 'react-stores'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { navigate } = useRouterHook()
    const { connect } = useArConnect()
    const net = $net.state.net as 'mainnet' | 'testnet'

    const loadingDoc = effectorStore($loadingDoc)
    const loading = effectorStore($loading)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const controller_ = effectorStore($doc)?.controller.toLowerCase()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    // const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const styles = isLight ? stylesLight : stylesDark
    const doc = effectorStore($doc)?.doc

    console.log('DID DOC:', JSON.stringify(doc, null, 2))
    let exists = false
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

    const { fetchDoc } = useFetch()

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.info('Key copied to clipboard!', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: toastTheme(isLight),
        })
    }

    useEffect(() => {
        fetchDoc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedDomain])

    const spinner = <Spinner />

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {loadingDoc || loading ? (
                spinner
            ) : (
                <>
                    {doc !== null &&
                        doc?.map((res: any) => {
                            if (res[0] === 'Decentralized identifier') {
                                const did = res[1] as string
                                switch (did) {
                                    case 'Not activated yet.':
                                        return (
                                            <div
                                                key={res}
                                                className={styles.docInfo}
                                            >
                                                <div
                                                    style={{
                                                        marginBottom: '2rem',
                                                    }}
                                                    className={styles.didkey}
                                                >
                                                    This DID has not been
                                                    created by {resolvedDomain}{' '}
                                                    yet.
                                                </div>
                                            </div>
                                        )
                                    default: {
                                        exists = true
                                        const addr_b16 = did.substring(19)
                                        const addr =
                                            zcrypto.toBech32Address(addr_b16)
                                        return (
                                            <div
                                                key={res}
                                                className={styles.docInfo}
                                                style={{ marginBottom: '10%' }}
                                            >
                                                <span className={styles.did}>
                                                    <a
                                                        href={
                                                            net === 'testnet'
                                                                ? `https://viewblock.io/zilliqa/address/${addr}?network=${net}`
                                                                : `https://viewblock.io/zilliqa/address/${addr}`
                                                        }
                                                        rel="noreferrer"
                                                        target="_blank"
                                                    >
                                                        {did
                                                            .substring(0, 19)
                                                            .replace(
                                                                'main',
                                                                net ===
                                                                    'testnet'
                                                                    ? 'test'
                                                                    : 'main'
                                                            )}
                                                        {addr_b16}
                                                    </a>
                                                </span>
                                            </div>
                                        )
                                    }
                                }
                            }
                        })}
                    {exists && (
                        <>
                            <h3 className={styles.title}>
                                {t('VERIFICATION METHODS')}
                            </h3>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    textAlign: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                {doc !== null &&
                                    doc?.map((res: any) => {
                                        if (
                                            res[0] !==
                                                'Decentralized identifier' &&
                                            res[0] !== 'DID services'
                                        ) {
                                            return (
                                                <div
                                                    key={res}
                                                    className={styles.docInfo}
                                                >
                                                    <h3
                                                        className={
                                                            styles.blockHead
                                                        }
                                                    >
                                                        {t(`${res[0]}`)}
                                                    </h3>
                                                    {res[1].map(
                                                        (element: any) => {
                                                            return (
                                                                <div
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                    }}
                                                                    onClick={() =>
                                                                        copyToClipboard(
                                                                            element
                                                                        )
                                                                    }
                                                                    key={
                                                                        element
                                                                    }
                                                                    className={
                                                                        styles.didkey
                                                                    }
                                                                >
                                                                    {element}
                                                                </div>
                                                            )
                                                        }
                                                    )}
                                                </div>
                                            )
                                        }
                                    })}
                            </div>
                            {controller_ === zilpay_addr && (
                                <div
                                    onClick={async () => {
                                        await connect().then(() => {
                                            const arConnect =
                                                $arconnect.getState()
                                            if (arConnect) {
                                                navigate(
                                                    `/${subdomainNavigate}${resolvedDomain}/didx/wallet/doc/update`
                                                )
                                            }
                                        })
                                    }}
                                    className="button"
                                    style={{ marginTop: '50px' }}
                                >
                                    {t('UPDATE KEYS')}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
