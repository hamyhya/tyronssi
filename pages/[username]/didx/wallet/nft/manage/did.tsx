import Layout from '../../../../../../components/Layout'
import { Headline } from '../../../../../../components'
import styles from '../../../../../styles.module.scss'
import { GetStaticPaths } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

function Header() {
    const { t } = useTranslation()
    const data = [
        {
            name: t('WALLET'),
            route: '/didx/wallet',
        },
        {
            name: t('NFT OPERATIONS'),
            route: '/didx/wallet/nft',
        },
        {
            name: t('MANAGE NFT'),
            route: '/didx/wallet/nft/manage',
        },
    ]

    return (
        <>
            <Layout>
                <div className={styles.headlineWrapper}>
                    <Headline data={data} />
                    <h2 className={styles.title}>{t('UPDATE NFT DID')}</h2>
                </div>
                {/* <UpdateNftDid /> */}
                <h4>{t('COMING SOON')}</h4>
            </Layout>
        </>
    )
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
    return {
        paths: [],
        fallback: 'blocking',
    }
}

export const getStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale, ['common'])),
    },
})

export default Header
